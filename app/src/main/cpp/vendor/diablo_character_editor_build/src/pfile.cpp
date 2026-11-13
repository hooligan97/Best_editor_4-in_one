// Derived from DevilutionX's Source/pfile.cpp
// License: https://github.com/diasurgical/devilutionX/blob/master/LICENSE.md

#include "pfile.h"
#include "codec.h"
#include <android/log.h>

namespace devilution {

bool gbIsMultiplayer;
bool gbIsSpawn;
bool gbIsHellfire;
bool gbIsHellfireSaveGame;

namespace {
constexpr const char *PASSWORD_SPAWN_SINGLE = "adslhfb1";
constexpr const char *PASSWORD_SPAWN_MULTI = "lshbkfg1";
constexpr const char *PASSWORD_SINGLE = "xrgyrkj1";
constexpr const char *PASSWORD_MULTI = "szqnlsk1";
} // namespace

const char *pfile_get_password()
{
    const char* pwd = nullptr;
    if (gbIsSpawn)
        pwd = gbIsMultiplayer ? PASSWORD_SPAWN_MULTI : PASSWORD_SPAWN_SINGLE;
    else
        pwd = gbIsMultiplayer ? PASSWORD_MULTI : PASSWORD_SINGLE;
    
    __android_log_print(ANDROID_LOG_INFO, "D1SaveBridge", "Selected password profile (Multi: %d, Spawn: %d)", gbIsMultiplayer, gbIsSpawn);
    return pwd;
}

std::unique_ptr<std::byte[]> ReadArchive(MpqArchive &archive, const char *pszName, size_t *pdwLen)
{
    if (pdwLen == nullptr || pszName == nullptr) return nullptr;
    *pdwLen = 0;
    if (!archive.HasFile(pszName)) {
        __android_log_print(ANDROID_LOG_ERROR, "D1SaveBridge", "MPQ entry '%s' was not found", pszName);
        return nullptr;
    }
    int32_t error = 0;
    auto data = archive.ReadFile(pszName, *pdwLen, error);
    if (!data || *pdwLen == 0) {
        __android_log_print(ANDROID_LOG_ERROR, "D1SaveBridge", "MPQ entry '%s' read failed (error=%d)", pszName, error);
        *pdwLen = 0;
        return nullptr;
    }
    const std::size_t encodedSize = *pdwLen;
    const std::size_t decodedSize = codec_decode(data.get(), encodedSize, pfile_get_password());
    if (decodedSize == 0) {
        __android_log_print(ANDROID_LOG_ERROR, "D1SaveBridge", "MPQ entry '%s' failed codec validation (encoded=%zu)", pszName, encodedSize);
        *pdwLen = 0;
        return nullptr;
    }
    *pdwLen = decodedSize;
    __android_log_print(ANDROID_LOG_INFO, "D1SaveBridge", "MPQ entry '%s' decoded: %zu -> %zu bytes", pszName, encodedSize, decodedSize);
    return data;
}

} // namespace devilution
