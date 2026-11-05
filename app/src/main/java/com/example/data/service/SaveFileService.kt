package com.example.data.service

import com.example.data.model.HeroCharacter
import com.example.data.parser.DevilutionXSaveParser
import com.example.data.parser.MpqHeaderInfo
import com.example.data.parser.MpqTool
import com.example.data.parser.NativeSaveBridge
import com.example.data.parser.SaveConstants
import java.io.File
import java.util.UUID

/**
 * Service for handling DevilutionX save file I/O operations.
 * Acts as a clean interface between the ViewModel and parsing utilities.
 */
class SaveFileService {

    /**
     * Parses binary save data into a HeroCharacter object.
     */
    fun parseSave(bytes: ByteArray, filename: String = ""): HeroCharacter {
        return DevilutionXSaveParser.parseSaveBytes(bytes, filename)
    }

    /**
     * Serializes a HeroCharacter back into a binary MPQ save file.
     */
    fun exportSave(hero: HeroCharacter): ByteArray {
        return DevilutionXSaveParser.createSaveFileMpq(hero)
    }

    /**
     * Uses the native PlayerPack writer on a staged copy of the imported MPQ.
     * The original bytes are backed up before the staged archive is modified.
     * Only fields currently supported by NativeSaveBridge.patchField are patched.
     */
    fun exportNativeSave(
        originalBytes: ByteArray,
        hero: HeroCharacter,
        backupDirectory: File,
    ): ByteArray {
        require(originalBytes.isNotEmpty()) { "No imported MPQ bytes are available." }
        check(backupDirectory.mkdirs() || backupDirectory.isDirectory) {
            "Unable to create native save backup directory."
        }

        val id = UUID.randomUUID().toString()
        val extension = if (hero.gameMod == com.example.data.model.GameMod.HELLFIRE) SaveConstants.HELLFIRE_EXTENSION else SaveConstants.STANDARD_EXTENSION
        val stagedArchive = File(backupDirectory, "${SaveConstants.TEMP_FILE_PREFIX.replace("-", "_")}$id.$extension")
        val backupFile = File(backupDirectory, "native-backup-$id.bak")
        backupFile.writeBytes(originalBytes)
        stagedArchive.writeBytes(originalBytes)
import com.example.data.model.DiabloItem
import com.example.data.model.EquipSlot
import java.nio.ByteBuffer
import java.nio.ByteOrder

// ... (existing code)

    /**
     * Serializes a list of DiabloItems into a ByteArray of fixed-size ItemPack structs.
     */
    private fun serializeItems(items: List<DiabloItem?>, maxItems: Int): ByteArray {
        // ItemPack size: 19 bytes (based on pack.h definition)
        // struct ItemPack { uint32_t iSeed; uint16_t iCreateInfo; uint16_t idx; uint8_t bId; ... };
        // Wait, let's verify ItemPack size from pack.h.
        // uint32_t iSeed (4) + uint16_t iCreateInfo (2) + uint16_t idx (2) + uint8_t bId (1) + uint8_t bDur (1) + uint8_t bMDur (1) + uint8_t bCh (1) + uint8_t bMCh (1) + uint16_t wValue (2) + uint32_t dwBuff (4) = 19?
        // Actually, struct packing might make it 20. Let's use 20.
        val itemSize = 20
        val buffer = ByteBuffer.allocate(maxItems * itemSize).order(ByteOrder.LITTLE_ENDIAN)

        for (i in 0 until maxItems) {
            val item = items.getOrNull(i)
            if (item == null) {
                buffer.putInt(0) // iSeed = 0
                buffer.position(buffer.position() + itemSize - 4)
            } else {
                buffer.putInt(item.iSeed)
                buffer.putShort(0) // iCreateInfo
                buffer.putShort(item.itemIndex.toShort())
                buffer.put(0) // bId
                buffer.put(item.durability.toByte())
                buffer.put(item.maxDurability.toByte())
                buffer.put(0) // bCh
                buffer.put(0) // bMCh
                buffer.putShort(0) // wValue
                buffer.putInt(0) // dwBuff
            }
        }
        return buffer.array()
    }

    /**
     * Uses the native PlayerPack writer on a staged copy of the imported MPQ.
     */
    fun exportNativeSave(
        originalBytes: ByteArray,
        hero: HeroCharacter,
        backupDirectory: File,
    ): ByteArray {
        // ... (existing code)
        try {
            // ... (existing code)
            fun patch(field: String, value: Any) {
                rawHero = NativeSaveBridge.patchField(rawHero, field, value)
            }

            // ... (existing primitive patches)

            // New inventory patches
            val invBodyItems = listOfNulls<DiabloItem>(7)
            EquipSlot.entries.forEachIndexed { index, slot -> 
                invBodyItems[index] = hero.equipment[slot] 
            }
            patch("invBody", serializeItems(invBodyItems, 7))

            val invListItems = hero.inventory.take(40)
            patch("invList", serializeItems(invListItems, 40))

            // ... (existing writeHero)


    /**
     * Analyzes MPQ header info from raw bytes (useful for diagnostic).
     */
    fun analyzeHeader(bytes: ByteArray): MpqHeaderInfo {
        return MpqTool.analyzeMpqHeader(bytes)
    }

    /**
     * Generates a hex dump string for debugging save file content.
     */
    fun generateHexDump(bytes: ByteArray, bytesPerLine: Int = 24): String {
        return MpqTool.formatHexDump(bytes, bytesPerLine)
    }
}
