#include <jni.h>
#include <android/log.h>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <limits>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>

#include "codec.h"
#include "pack.h"
#include "pfile.h"
#include "mpq/mpq_reader.hpp"
#include "mpq/mpq_writer.hpp"

namespace devilution {
uint32_t gSaveNumber = 0;
}

namespace {
using namespace devilution;

std::mutex gSaveCoreMutex;

void LogInfo(const std::string &message)
{
    __android_log_print(ANDROID_LOG_INFO, "D1SaveBridge", "%s", message.c_str());
}

void LogError(const std::string &message)
{
    __android_log_print(ANDROID_LOG_ERROR, "D1SaveBridge", "%s", message.c_str());
}

void ThrowJava(JNIEnv *env, const char *className, const std::string &message)
{
    if (env == nullptr || env->ExceptionCheck()) return;
    jclass exceptionClass = env->FindClass(className);
    if (exceptionClass == nullptr) return;
    env->ThrowNew(exceptionClass, message.c_str());
    env->DeleteLocalRef(exceptionClass);
}

void ConfigureGameFlags(bool multiplayer, bool spawn, bool hellfire)
{
    gbIsMultiplayer = multiplayer;
    gbIsSpawn = spawn;
    gbIsHellfire = hellfire;
    gbIsHellfireSaveGame = hellfire;
}

template <typename T>
void Patch(std::byte *raw, size_t offset, int64_t value)
{
    if (value < static_cast<int64_t>(std::numeric_limits<T>::min()) ||
        value > static_cast<int64_t>(std::numeric_limits<T>::max()))
        throw std::out_of_range("Value does not fit selected PlayerPack field.");
    const T converted = static_cast<T>(value);
    std::memcpy(raw + offset, &converted, sizeof(T));
}

class UtfChars {
public:
    UtfChars(JNIEnv *env, jstring value)
        : env_(env), value_(value), chars_(env->GetStringUTFChars(value, nullptr)) {}
    ~UtfChars() { if (chars_ != nullptr) env_->ReleaseStringUTFChars(value_, chars_); }
    UtfChars(const UtfChars &) = delete;
    UtfChars &operator=(const UtfChars &) = delete;
    const char *get() const { return chars_; }
private:
    JNIEnv *env_;
    jstring value_;
    const char *chars_;
};
} // namespace

constexpr size_t MIN_SAVE_SIZE = sizeof(devilution::PlayerPack);
static_assert(sizeof(devilution::ItemPack) == 19, "Unexpected ItemPack layout");
static_assert(sizeof(devilution::PlayerPack) == 1266, "Unexpected PlayerPack layout");
static_assert(offsetof(devilution::PlayerPack, InvBody) == 0x7C, "Unexpected InvBody offset");
static_assert(offsetof(devilution::PlayerPack, InvList) == 0x101, "Unexpected InvList offset");

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_data_parser_NativeSaveBridge_readHero(
    JNIEnv *env, jclass, jstring savePath, jboolean multiplayer, jboolean spawn,
    jboolean hellfire, jboolean hellfireSaveGame)
{
    LogInfo("readHero: JNI entry");
    if (env == nullptr) return nullptr;
    if (savePath == nullptr) {
        ThrowJava(env, "java/lang/NullPointerException", "savePath must not be null.");
        return nullptr;
    }
    UtfChars path(env, savePath);
    if (path.get() == nullptr) {
        if (!env->ExceptionCheck())
            ThrowJava(env, "java/lang/IllegalArgumentException", "Could not read savePath string.");
        return nullptr;
    }
    try {
        std::lock_guard<std::mutex> lock(gSaveCoreMutex);
        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE, hellfire == JNI_TRUE);
        gbIsHellfireSaveGame = hellfireSaveGame == JNI_TRUE;
        int32_t error = 0;
        LogInfo("readHero: opening MPQ archive");
        auto archive = MpqArchive::Open(path.get(), error);
        if (!archive)
            throw std::runtime_error(std::string("Could not open MPQ archive: ") + MpqArchive::ErrorMessage(error));
        size_t size = 0;
        LogInfo("readHero: extracting and decoding hero entry");
        auto payload = ReadArchive(*archive, "hero", &size);
        if (!payload)
            throw std::runtime_error("Could not extract or decode MPQ entry 'hero'.");
        if (size < MIN_SAVE_SIZE)
            throw std::runtime_error("Decoded hero payload is smaller than PlayerPack (actual " +
                std::to_string(size) + ", expected at least " + std::to_string(MIN_SAVE_SIZE) + " bytes).");
        if (size > static_cast<size_t>(std::numeric_limits<jsize>::max()))
            throw std::runtime_error("Decoded hero payload exceeds JNI array size limit.");
        const jsize resultSize = static_cast<jsize>(size);
        jbyteArray result = env->NewByteArray(resultSize);
        if (result == nullptr) return nullptr;
        env->SetByteArrayRegion(result, 0, resultSize,
            reinterpret_cast<const jbyte *>(payload.get()));
        if (env->ExceptionCheck()) {
            env->DeleteLocalRef(result);
            return nullptr;
        }
        LogInfo("readHero: success, decoded bytes=" + std::to_string(size));
        return result;
    } catch (const std::exception &e) {
        LogError(std::string("readHero failed: ") + e.what());
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        LogError("readHero failed: unknown native exception");
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save read error.");
    }
    return nullptr;
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_data_parser_NativeSaveBridge_patchField(
    JNIEnv *env, jclass, jbyteArray rawHero, jstring fieldName, jobject value)
{
    LogInfo("PatchField: Start");
    if (env == nullptr) return nullptr;
    if (rawHero == nullptr || fieldName == nullptr || value == nullptr) {
        ThrowJava(env, "java/lang/NullPointerException", "patchField arguments must not be null.");
        return nullptr;
    }
    try {
        std::lock_guard<std::mutex> saveCoreLock(gSaveCoreMutex);
        const jsize size = env->GetArrayLength(rawHero);
        if (size < MIN_SAVE_SIZE) {
            ThrowJava(env, "java/lang/IllegalArgumentException", "Raw payload size too small.");
            return nullptr;
        }
        
        LogInfo("PatchField: Allocating buffer");
        auto bytes = std::make_unique<std::byte[]>(static_cast<size_t>(size));
        env->GetByteArrayRegion(rawHero, 0, size, reinterpret_cast<jbyte *>(bytes.get()));
        if (env->ExceptionCheck()) return nullptr;

        UtfChars field(env, fieldName);
        if (field.get() == nullptr) return nullptr;
        const std::string name(field.get());

        LogInfo("PatchField: Applying patch for field: " + name);
        
        jclass byteArrayClass = env->FindClass("[B");
        if (byteArrayClass == nullptr) return nullptr;
        if (env->IsInstanceOf(value, byteArrayClass)) {
            jbyteArray valueArray = static_cast<jbyteArray>(value);
            const jsize valueSize = env->GetArrayLength(valueArray);
            auto valueBytes = std::make_unique<uint8_t[]>(static_cast<size_t>(valueSize));
            env->GetByteArrayRegion(valueArray, 0, valueSize, reinterpret_cast<jbyte *>(valueBytes.get()));

            if (name == "invBody") {
                if (valueSize != NUM_INVLOC * sizeof(ItemPack)) {
                    LogInfo("PatchField: invBody size mismatch");
                    ThrowJava(env, "java/lang/IllegalArgumentException", "invBody size mismatch");
                    return nullptr;
                }
                std::memcpy(reinterpret_cast<uint8_t*>(bytes.get()) + offsetof(PlayerPack, InvBody), valueBytes.get(), valueSize);
            } else if (name == "invList") {
                if (valueSize != InventoryGridCells * sizeof(ItemPack)) {
                    LogInfo("PatchField: invList size mismatch");
                    ThrowJava(env, "java/lang/IllegalArgumentException", "invList size mismatch");
                    return nullptr;
                }
                std::memcpy(reinterpret_cast<uint8_t*>(bytes.get()) + offsetof(PlayerPack, InvList), valueBytes.get(), valueSize);
            } else {
                LogInfo("PatchField: Unsupported ByteArray field: " + name);
                ThrowJava(env, "java/lang/IllegalArgumentException", "Unsupported ByteArray field: " + name);
                return nullptr;
            }
        } 
        else {
            jclass longClass = env->FindClass("java/lang/Long");
            if (longClass == nullptr) return nullptr;
            if (env->IsInstanceOf(value, longClass)) {
                jmethodID longValueMethod = env->GetMethodID(longClass, "longValue", "()J");
                if (longValueMethod == nullptr) return nullptr;
                jlong longValue = env->CallLongMethod(value, longValueMethod);
                if (env->ExceptionCheck()) return nullptr;

                if (name == "level") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pLevel), longValue);
                else if (name == "class") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pClass), longValue);
                else if (name == "baseStrength") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pBaseStr), longValue);
                else if (name == "baseMagic") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pBaseMag), longValue);
                else if (name == "baseDexterity") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pBaseDex), longValue);
                else if (name == "baseVitality") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pBaseVit), longValue);
                else if (name == "statPoints") Patch<uint8_t>(bytes.get(), offsetof(PlayerPack, pStatPts), longValue);
                else if (name == "experience") Patch<uint32_t>(bytes.get(), offsetof(PlayerPack, pExperience), longValue);
                else if (name == "gold") Patch<int32_t>(bytes.get(), offsetof(PlayerPack, pGold), longValue);
                else if (name == "hpBase") Patch<int32_t>(bytes.get(), offsetof(PlayerPack, pHPBase), longValue);
                else if (name == "maxHpBase") Patch<int32_t>(bytes.get(), offsetof(PlayerPack, pMaxHPBase), longValue);
                else if (name == "manaBase") Patch<int32_t>(bytes.get(), offsetof(PlayerPack, pManaBase), longValue);
                else if (name == "maxManaBase") Patch<int32_t>(bytes.get(), offsetof(PlayerPack, pMaxManaBase), longValue);
                else {
                    LogInfo("PatchField: Unsupported Long field: " + name);
                    ThrowJava(env, "java/lang/IllegalArgumentException", "Unsupported Long field: " + name);
                    return nullptr;
                }
            } else {
                 LogInfo("PatchField: Unsupported object type");
                 ThrowJava(env, "java/lang/IllegalArgumentException", "Unsupported object type passed to patchField.");
                 return nullptr;
            }
        }

        jbyteArray result = env->NewByteArray(size);
        if (result == nullptr) return nullptr;
        env->SetByteArrayRegion(result, 0, size, reinterpret_cast<const jbyte *>(bytes.get()));
        if (env->ExceptionCheck()) {
            env->DeleteLocalRef(result);
            return nullptr;
        }
        return result;
    } catch (const std::exception &e) {
        LogInfo(std::string("WYJĄTEK C++ (PatchField): ") + e.what());
        ThrowJava(env, "java/lang/IllegalArgumentException", e.what());
    } catch (...) {
        LogInfo("WYJĄTEK C++ (PatchField): Nieznany");
        ThrowJava(env, "java/lang/IllegalArgumentException", "Unknown raw field patch error.");
    }
    return nullptr;
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_data_parser_NativeSaveBridge_writeHero(
    JNIEnv *env, jclass, jstring savePath, jbyteArray rawHero,
    jboolean multiplayer, jboolean spawn, jboolean hellfire)
{
    LogInfo("writeHero: JNI entry");
    if (env == nullptr) return;
    if (savePath == nullptr || rawHero == nullptr) {
        ThrowJava(env, "java/lang/NullPointerException", "savePath and rawHero must not be null.");
        return;
    }
    UtfChars path(env, savePath);
    if (path.get() == nullptr) {
        if (!env->ExceptionCheck())
            ThrowJava(env, "java/lang/IllegalArgumentException", "Could not read savePath string.");
        return;
    }
    try {
        std::lock_guard<std::mutex> lock(gSaveCoreMutex);
        const jsize size = env->GetArrayLength(rawHero);
        if (static_cast<size_t>(size) < MIN_SAVE_SIZE)
            throw std::invalid_argument("Raw hero payload is smaller than PlayerPack.");
        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE, hellfire == JNI_TRUE);
        const size_t encodedSize = codec_get_encoded_len(static_cast<size_t>(size));
        auto encoded = std::make_unique<std::byte[]>(encodedSize);
        std::memset(encoded.get(), 0, encodedSize);
        env->GetByteArrayRegion(rawHero, 0, size, reinterpret_cast<jbyte *>(encoded.get()));
        if (env->ExceptionCheck()) return;
        codec_encode(encoded.get(), static_cast<size_t>(size), encodedSize, pfile_get_password());
        {
            MpqWriter writer(path.get());
            if (!writer.WriteFile("hero", encoded.get(), encodedSize))
                throw std::runtime_error("MPQ writer could not replace the 'hero' entry.");
        }
        int32_t error = 0;
        auto verifyArchive = MpqArchive::Open(path.get(), error);
        if (!verifyArchive)
            throw std::runtime_error(std::string("Could not reopen written MPQ: ") + MpqArchive::ErrorMessage(error));
        size_t verifiedSize = 0;
        auto verifiedHero = ReadArchive(*verifyArchive, "hero", &verifiedSize);
        if (!verifiedHero)
            throw std::runtime_error("Written MPQ does not contain a readable 'hero' entry.");
        if (verifiedSize != static_cast<size_t>(size))
            throw std::runtime_error("Written hero payload size does not match the edited payload.");
        std::vector<std::byte> expected(static_cast<size_t>(size));
        env->GetByteArrayRegion(rawHero, 0, size, reinterpret_cast<jbyte *>(expected.data()));
        if (env->ExceptionCheck()) return;
        if (std::memcmp(verifiedHero.get(), expected.data(), static_cast<size_t>(size)) != 0)
            throw std::runtime_error("Written hero payload verification failed (decoded bytes differ).");
        LogInfo("writeHero: MPQ write and read-back verification succeeded");
    } catch (const std::exception &e) {
        LogError(std::string("writeHero failed: ") + e.what());
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        LogError("writeHero failed: unknown native exception");
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save write error.");
    }
}
