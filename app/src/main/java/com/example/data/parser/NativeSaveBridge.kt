package com.example.data.parser

/**
 * JNI interface to the upstream Diablo save core.
 *
 * readHero returns the decrypted, uncompressed PlayerPack bytes. Keep those bytes
 * as the editing session's source of truth. patchField returns a copy with one
 * supported field changed, preserving every other byte including unknown/reserved data.
 */
object NativeSaveBridge {
    init {
        System.loadLibrary("d1savebridge")
    }

    @JvmStatic
    external fun readHero(savePath: String, multiplayer: Boolean, spawn: Boolean): ByteArray

    @JvmStatic
    external fun patchField(rawHero: ByteArray, fieldName: String, value: Long): ByteArray

    /**
     * Re-encodes the decoded PlayerPack and replaces only MPQ's "hero" entry.
     * Save to a copy of the original archive before writing.
     */
    @JvmStatic
    external fun writeHero(
        savePath: String,
        rawHero: ByteArray,
        multiplayer: Boolean,
        spawn: Boolean,
        hellfire: Boolean,
    )
}
