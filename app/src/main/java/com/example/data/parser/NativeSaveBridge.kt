package com.example.data.parser

/**
 * JNI boundary for the DevilutionX-derived MPQ + save codec.
 *
 * The byte array returned by [readHero] is the exact decoded PlayerPack payload.
 * Keep it as the authoritative raw snapshot; map fields for UI separately and patch
 * only fields the user changed before calling [writeHero].
 *
 * This API intentionally does not serialize through JSON.
 */
object NativeSaveBridge {
    init {
        System.loadLibrary("d1savebridge")
    }

    /**
     * Opens an existing .sv/.hsv MPQ and returns its decoded "hero" payload.
     *
     * @throws IllegalStateException if the archive, codec signature, or payload is invalid.
     */
    @JvmStatic
    external fun readHero(
        savePath: String,
        multiplayer: Boolean,
        spawn: Boolean,
    ): ByteArray

    /**
     * Re-encodes [rawHero] and updates only the "hero" MPQ entry in [savePath].
     * All fields not patched in [rawHero] remain byte-for-byte as supplied.
     *
     * Save to a copy first; the native MPQ writer updates the target archive.
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
