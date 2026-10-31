package com.example.data.service

import com.example.data.model.HeroCharacter
import com.example.data.parser.DevilutionXSaveParser
import com.example.data.parser.MpqHeaderInfo
import com.example.data.parser.MpqTool
import com.example.data.parser.NativeSaveBridge
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
        val extension = if (hero.gameMod == com.example.data.model.GameMod.HELLFIRE) "hsv" else "sv"
        val stagedArchive = File(backupDirectory, "native-stage-$id.$extension")
        val backupFile = File(backupDirectory, "native-backup-$id.bak")
        backupFile.writeBytes(originalBytes)
        stagedArchive.writeBytes(originalBytes)

        try {
            var rawHero = NativeSaveBridge.readHero(
                stagedArchive.absolutePath,
                hero.isMultiplayer,
                false,
            )
            fun patch(field: String, value: Long) {
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
            patch("hpBase", hero.baseLife.toLong() * 64L)
            patch("maxHpBase", hero.maxLife.toLong() * 64L)
            patch("manaBase", hero.baseMana.toLong() * 64L)
            patch("maxManaBase", hero.maxMana.toLong() * 64L)

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
