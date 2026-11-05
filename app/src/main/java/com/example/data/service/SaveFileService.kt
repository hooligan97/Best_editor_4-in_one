package com.example.data.service

import com.example.data.model.HeroCharacter
import com.example.data.model.DiabloItem
import com.example.data.model.EquipSlot
import com.example.data.parser.DevilutionXSaveParser
import com.example.data.parser.MpqHeaderInfo
import com.example.data.parser.MpqTool
import com.example.data.parser.NativeSaveBridge
import com.example.data.parser.SaveConstants
import java.io.File
import java.util.UUID
import java.nio.ByteBuffer
import java.nio.ByteOrder

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
     * Serializes a list of DiabloItems into a ByteArray of fixed-size ItemPack structs.
     */
    private fun serializeItems(items: List<DiabloItem?>, maxItems: Int): ByteArray {
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

        try {
            val isHellfire = hero.gameMod == com.example.data.model.GameMod.HELLFIRE
            var rawHero = NativeSaveBridge.readHero(
                stagedArchive.absolutePath,
                hero.isMultiplayer,
                false,
                isHellfire,
                isHellfire
            )
            fun patch(field: String, value: Any) {
                rawHero = NativeSaveBridge.patchField(rawHero, field, value)
            }

            patch("level", hero.level.toLong())
            patch("class", hero.heroClass.ordinal.toLong())
            patch("baseStrength", hero.baseStrength.toLong())
            patch("baseMagic", hero.baseMagic.toLong())
            patch("baseDexterity", hero.baseDexterity.toLong())
            patch("baseVitality", hero.baseVitality.toLong())
            patch("statPoints", hero.statPoints.toLong())
            patch("experience", hero.experience)
            patch("gold", hero.gold)
            patch("hpBase", hero.baseLife.toLong() * SaveConstants.HP_MANA_SCALE_FACTOR)
            patch("maxHpBase", hero.maxLife.toLong() * SaveConstants.HP_MANA_SCALE_FACTOR)
            patch("manaBase", hero.baseMana.toLong() * SaveConstants.HP_MANA_SCALE_FACTOR)
            patch("maxManaBase", hero.maxMana.toLong() * SaveConstants.HP_MANA_SCALE_FACTOR)
            
            // Inventory patches
            val invBodyItems = arrayOfNulls<DiabloItem>(7)
            EquipSlot.entries.forEachIndexed { index, slot -> 
                invBodyItems[index] = hero.equipment[slot] 
            }
            patch("invBody", serializeItems(invBodyItems.toList(), 7))
            
            val invListItems = hero.inventory.take(40)
            patch("invList", serializeItems(invListItems, 40))

            NativeSaveBridge.writeHero(
                stagedArchive.absolutePath,
                rawHero,
                hero.isMultiplayer,
                false,
                hero.gameMod == com.example.data.model.GameMod.HELLFIRE,
            )
            return stagedArchive.readBytes()
        } finally {
            stagedArchive.delete()
        }
    }

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
