#include <jni.h>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <memory>
#include <stdexcept>
#include <string>

#include "codec.h"
#include "pack.h"
#include "pfile.h"
#include "mpq/mpq_writer.hpp"

namespace devilution {
uint32_t gSaveNumber = 0;
}

namespace {
using namespace devilution;

void ConfigureGameFlags(bool multiplayer, bool spawn, bool hellfire)
{
    gbIsMultiplayer = multiplayer;
    gbIsSpawn = spawn;
    gbIsHellfire = hellfire;
    gbIsHellfireSaveGame = hellfire;
}

void ThrowJava(JNIEnv *env, const char *className, const std::string &message)
{
    jclass exceptionClass = env->FindClass(className);
    if (exceptionClass != nullptr)
        env->ThrowNew(exceptionClass, message.c_str());
}
} // namespace

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_data_parser_NativeSaveBridge_readHero(
    JNIEnv *env, jclass, jstring savePath, jboolean multiplayer, jboolean spawn)
{
    const char *path = env->GetStringUTFChars(savePath, nullptr);
    if (path == nullptr)
        return nullptr;

    try {
        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE,
                           std::string(path).size() >= 4 &&
                               std::string(path).substr(std::string(path).size() - 4) == ".hsv");

        int32_t error = 0;
        auto archive = MpqArchive::Open(path, error);
        if (!archive) {
            ThrowJava(env, "java/lang/IllegalStateException",
                      std::string("Could not open MPQ archive: ") + MpqArchive::ErrorMessage(error));
            env->ReleaseStringUTFChars(savePath, path);
            return nullptr;
        }

        size_t payloadSize = 0;
        auto payload = ReadArchive(*archive, "hero", &payloadSize);
        if (!payload || payloadSize != sizeof(PlayerPack)) {
            ThrowJava(env, "java/lang/IllegalStateException",
                      "Invalid hero payload: decoded size does not match PlayerPack.");
            env->ReleaseStringUTFChars(savePath, path);
            return nullptr;
        }

        jbyteArray result = env->NewByteArray(static_cast<jsize>(payloadSize));
        if (result != nullptr)
            env->SetByteArrayRegion(result, 0, static_cast<jsize>(payloadSize),
                                    reinterpret_cast<const jbyte *>(payload.get()));
        env->ReleaseStringUTFChars(savePath, path);
        return result;
    } catch (const std::exception &e) {
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save read error.");
    }

    env->ReleaseStringUTFChars(savePath, path);
    return nullptr;
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_data_parser_NativeSaveBridge_writeHero(
    JNIEnv *env, jclass, jstring savePath, jbyteArray rawHero,
    jboolean multiplayer, jboolean spawn, jboolean hellfire)
{
    const char *path = env->GetStringUTFChars(savePath, nullptr);
    if (path == nullptr)
        return;

    try {
        const jsize payloadSize = env->GetArrayLength(rawHero);
        if (payloadSize != static_cast<jsize>(sizeof(PlayerPack))) {
            ThrowJava(env, "java/lang/IllegalArgumentException",
                      "Raw hero payload has an unexpected size.");
            env->ReleaseStringUTFChars(savePath, path);
            return;
        }

        ConfigureGameFlags(multiplayer == JNI_TRUE, spawn == JNI_TRUE,
                           hellfire == JNI_TRUE);

        const size_t encodedSize = codec_get_encoded_len(static_cast<size_t>(payloadSize));
        std::unique_ptr<std::byte[]> encoded(new std::byte[encodedSize]);
        env->GetByteArrayRegion(rawHero, 0, payloadSize,
                                reinterpret_cast<jbyte *>(encoded.get()));
        if (env->ExceptionCheck()) {
            env->ReleaseStringUTFChars(savePath, path);
            return;
        }

        codec_encode(encoded.get(), static_cast<size_t>(payloadSize), encodedSize,
                     pfile_get_password());

        // MpqWriter updates the archive's "hero" entry and retains other entries.
        MpqWriter writer(path);
        if (!writer.WriteFile("hero", encoded.get(), encodedSize)) {
            ThrowJava(env, "java/lang/IllegalStateException",
                      "MPQ writer could not replace the hero entry.");
            env->ReleaseStringUTFChars(savePath, path);
            return;
        }

        env->ReleaseStringUTFChars(savePath, path);
    } catch (const std::exception &e) {
        ThrowJava(env, "java/lang/IllegalStateException", e.what());
    } catch (...) {
        ThrowJava(env, "java/lang/IllegalStateException", "Unknown native save write error.");
    }

    env->ReleaseStringUTFChars(savePath, path);
}
