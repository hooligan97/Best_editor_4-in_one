#include <jni.h>
#include <android/log.h>

#include <algorithm>
#include <cctype>
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

// The upstream save core stores game flags in globals; serialize JNI archive operations.
std::mutex gSaveCoreMutex;

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

void ThrowJava(JNIEnv *env, const char *className, const std::string &message)
{
    jclass exceptionClass = env->FindClass(className);
    if (exceptionClass != nullptr) env->ThrowNew(exceptionClass, message.c_str());
}

void ConfigureGameFlags(bool multiplayer, bool spawn, bool hellfire)
{
    gbIsMultiplayer = multiplayer;
    gbIsSpawn = spawn;
    gbIsHellfire = hellfire;
    gbIsHellfireSaveGame = hellfire;
}

bool IsHellfirePath(const std::string &path)
{
    if (path.size() < 4) return false;
    std::string ext = path.substr(path.size() - 4);
    std::transform(ext.begin(), ext.end(), ext.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return ext == ".hsv";
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
} // namespace

// Define minimum size for stats reading - approximately up to pMaxManaBase (offsetof + sizeof)
constexpr size_t MIN_SAVE_SIZE = 812;

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_data_parser_NativeSaveBridge_readHero(
    JNIEnv *env, jclass, jstring savePath, jboolean multiplayer, jboolean spawn, jboolean hellfire, jboolean hellfireSaveGame)
{
    UtfChars path(env, savePath);
    if (path.get() == nullptr) return nullptr;
    try {
        std::lock_guard<std::mutex> saveCoreLock(gSaveCoreMutex);
        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE, hellfire == JNI_TRUE);
        gbIsHellfireSaveGame = hellfireSaveGame == JNI_TRUE;

        int32_t error = 0;
        auto archive = MpqArchive::Open(path.get(), error);
        if (!archive) {
            ThrowJava(env, "java/lang/IllegalStateException",
                      std::string("Could not open MPQ archive: ") + MpqArchive::ErrorMessage(error));
            return nullptr;
        }
        size_t size = 0;
        auto payload = ReadArchive(*archive, "hero", &size);

        // Decrypt the hero payload
        size = codec_decode(payload.get(), size, pfile_get_password());
        
        // Relaxed validation for VKDMod or potentially other modified saves
        if (size == 0 || size < MIN_SAVE_SIZE) { // Użyj wartości minimalnej lub MIN_VKDMOD_SIZE
            std::string errMsg = "Invalid hero payload. Actual size: " + std::to_string(size) +
                                 ", Expected size: " + std::to_string(sizeof(PlayerPack));
            __android_log_print(ANDROID_LOG_ERROR, "D1SaveBridge", "%s", errMsg.c_str());
            ThrowJava(env, "java/lang/IllegalStateException", errMsg);
            return nullptr;
        }
        // ... rest of the function ...

        jbyteArray result = env->NewByteArray(static_cast<jsize>(size));
        if (result != nullptr)
            env->SetByteArrayRegion(result, 0, static_cast<jsize>(size),
                                    reinterpret_cast<const jbyte *>(payload.get()));
        return result;
    } catch (const std::exception &e) {
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save read error.");
    }
    return nullptr;
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_data_parser_NativeSaveBridge_patchField(
    JNIEnv *env, jclass, jbyteArray rawHero, jstring fieldName, jobject value)
{
    if (rawHero == nullptr || fieldName == nullptr || value == nullptr) return nullptr;
    try {
        std::lock_guard<std::mutex> saveCoreLock(gSaveCoreMutex);
        const jsize size = env->GetArrayLength(rawHero);
        if (size < MIN_SAVE_SIZE) {
            ThrowJava(env, "java/lang/IllegalArgumentException", "Raw payload size too small.");
            return nullptr;
        }
        auto bytes = std::make_unique<std::byte[]>(static_cast<size_t>(size));
        env->GetByteArrayRegion(rawHero, 0, size, reinterpret_cast<jbyte *>(bytes.get()));
        if (env->ExceptionCheck()) return nullptr;

        UtfChars field(env, fieldName);
        if (field.get() == nullptr) return nullptr;
        const std::string name(field.get());

        // Check if value is a ByteArray
        if (env->IsInstanceOf(value, env->FindClass("([B"))) {
            jbyteArray valueArray = static_cast<jbyteArray>(value);
            const jsize valueSize = env->GetArrayLength(valueArray);
            auto valueBytes = std::make_unique<uint8_t[]>(static_cast<size_t>(valueSize));
            env->GetByteArrayRegion(valueArray, 0, valueSize, reinterpret_cast<jbyte *>(valueBytes.get()));

            if (name == "invBody") {
                if (valueSize != NUM_INVLOC * sizeof(ItemPack)) {
                    ThrowJava(env, "java/lang/IllegalArgumentException", "invBody size mismatch");
                    return nullptr;
                }
                std::memcpy(reinterpret_cast<uint8_t*>(bytes.get()) + offsetof(PlayerPack, InvBody), valueBytes.get(), valueSize);
            } else if (name == "invList") {
                if (valueSize != InventoryGridCells * sizeof(ItemPack)) {
                    ThrowJava(env, "java/lang/IllegalArgumentException", "invList size mismatch");
                    return nullptr;
                }
                std::memcpy(reinterpret_cast<uint8_t*>(bytes.get()) + offsetof(PlayerPack, InvList), valueBytes.get(), valueSize);
            } else {
                ThrowJava(env, "java/lang/IllegalArgumentException", "Unsupported raw PlayerPack field (ByteArray).");
                return nullptr;
            }
        } else {
            // Treat as long for primitive fields
            jclass longClass = env->FindClass("java/lang/Long");
            jmethodID longValueMethod = env->GetMethodID(longClass, "longValue", "()J");
            jlong longValue = env->CallLongMethod(value, longValueMethod);

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
                ThrowJava(env, "java/lang/IllegalArgumentException", "Unsupported raw PlayerPack field.");
                return nullptr;
            }
        }

        jbyteArray result = env->NewByteArray(size);
        if (result != nullptr)
            env->SetByteArrayRegion(result, 0, size, reinterpret_cast<const jbyte *>(bytes.get()));
        return result;
    } catch (const std::exception &e) {
        ThrowJava(env, "java/lang/IllegalArgumentException", e.what());
    } catch (...) {
        ThrowJava(env, "java/lang/IllegalArgumentException", "Unknown raw field patch error.");
    }
    return nullptr;
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_data_parser_NativeSaveBridge_writeHero(
    JNIEnv *env, jclass, jstring savePath, jbyteArray rawHero,
    jboolean multiplayer, jboolean spawn, jboolean hellfire)
{
    UtfChars path(env, savePath);
    if (path.get() == nullptr || rawHero == nullptr) return;
    try {
        // All save-core operations must be serialized: the upstream codec and
        // game flags use process-global state shared with readHero().
        std::lock_guard<std::mutex> saveCoreLock(gSaveCoreMutex);
        const jsize size = env->GetArrayLength(rawHero);
        if (size < MIN_SAVE_SIZE) {
            ThrowJava(env, "java/lang/IllegalArgumentException", "Raw payload size too small.");
            return;
        }
        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE, hellfire == JNI_TRUE);
        const size_t encodedSize = codec_get_encoded_len(static_cast<size_t>(size));
        auto encoded = std::make_unique<std::byte[]>(encodedSize);
        std::memset(encoded.get(), 0, encodedSize);
        env->GetByteArrayRegion(rawHero, 0, size, reinterpret_cast<jbyte *>(encoded.get()));
        if (env->ExceptionCheck()) return;
        codec_encode(encoded.get(), static_cast<size_t>(size), encodedSize, pfile_get_password());
        {
            MpqWriter writer(path.get());
            if (!writer.WriteFile("hero", encoded.get(), encodedSize)) {
                ThrowJava(env, "java/lang/IllegalStateException", "MPQ hero entry update failed.");
                return;
            }
        }
    } catch (const std::exception &e) {
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save write error.");
    }
}
