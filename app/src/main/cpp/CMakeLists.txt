cmake_minimum_required(VERSION 3.22.1)
project(d1savebridge LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# This JNI bridge is written against the C++ core in:
# https://github.com/hooligan97/diablo_character_editor_build
#
# Vendor/build its d1edit target (including libmpq, PKWare, zlib and bzip2)
# into this directory tree before enabling the Android native build. The core
# target must expose the headers under src/ and link to this shared library.
#
# Expected vendor layout:
#   app/src/main/cpp/vendor/diablo_character_editor_build/
#
# add_subdirectory(vendor/diablo_character_editor_build EXCLUDE_FROM_ALL)
# target_include_directories(d1savebridge PRIVATE
#   vendor/diablo_character_editor_build/src
#   vendor/diablo_character_editor_build/3p/PKWare)
# target_link_libraries(d1savebridge PRIVATE d1edit)

add_library(d1savebridge SHARED native_save_bridge.cpp)

# Deliberately fail configuration with a clear message until the upstream C++
# core is vendored. This prevents shipping a library that silently cannot parse.
if(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/vendor/diablo_character_editor_build/src/pack.h")
    message(FATAL_ERROR
        "Missing upstream save core. Vendor hooligan97/diablo_character_editor_build "
        "under app/src/main/cpp/vendor/diablo_character_editor_build before building.")
endif()

add_subdirectory(vendor/diablo_character_editor_build EXCLUDE_FROM_ALL)
target_include_directories(d1savebridge PRIVATE
    vendor/diablo_character_editor_build/src
    vendor/diablo_character_editor_build/3p/PKWare)
target_link_libraries(d1savebridge PRIVATE d1edit)
