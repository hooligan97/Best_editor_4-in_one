cmake_minimum_required(VERSION 3.22.1)
project(d1savebridge LANGUAGES C CXX)

# Work around legacy zlib version-script symbols with recent Android NDK linkers.
add_link_options(-Wl,--undefined-version)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(UPSTREAM_SAVE_CORE
    "${CMAKE_CURRENT_SOURCE_DIR}/vendor/diablo_character_editor_build")

if(NOT EXISTS "${UPSTREAM_SAVE_CORE}/src/pack.h")
    message(FATAL_ERROR
        "Missing upstream save core submodule. Initialize "
        "app/src/main/cpp/vendor/diablo_character_editor_build.")
endif()

# Upstream defines a desktop CLI executable in addition to d1edit. Android
# consumes only the library; keep the CLI target out of the default build.
add_subdirectory("${UPSTREAM_SAVE_CORE}" "${CMAKE_CURRENT_BINARY_DIR}/upstream")

# The old bundled zlib exports a version-script symbol absent from newer NDKs.
# Apply the compatibility option to zlib itself (parent add_link_options does not
# reliably reach dependency targets created by upstream FetchContent).
if(TARGET zlib)
    target_link_options(zlib PRIVATE -Wl,--undefined-version)
endif()
if(TARGET editor)
    set_property(TARGET editor PROPERTY EXCLUDE_FROM_ALL TRUE)
endif()

add_library(d1savebridge SHARED native_save_bridge.cpp)
target_include_directories(d1savebridge PRIVATE
    "${UPSTREAM_SAVE_CORE}/src"
    "${UPSTREAM_SAVE_CORE}/3p/PKWare")
target_link_libraries(d1savebridge PRIVATE d1edit)
