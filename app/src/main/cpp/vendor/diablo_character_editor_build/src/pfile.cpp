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
    
    __android_log_print(ANDROID_LOG_INFO, "D1SaveBridge", "Using password: %s (Multi: %d, Spawn: %d)", pwd, gbIsMultiplayer, gbIsSpawn);
    return pwd;
}

std::unique_ptr<std::byte[]> ReadArchive(MpqArchive &archive, const char *pszName, size_t *pdwLen)
{
    int32_t error;
    auto data = archive.ReadFile(pszName, *pdwLen, error);
    if (!data)
        return nullptr;
    const std::size_t decoded = codec_decode(data.get(), *pdwLen, pfile_get_password());
    if (decoded == 0)
        return nullptr;
    *pdwLen = decoded;
    return data;
}

} // namespace devilution
