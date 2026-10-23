package com.example.data.service

import com.example.data.model.HeroCharacter
import com.example.data.parser.DevilutionXSaveParser
import com.example.data.parser.MpqHeaderInfo
import com.example.data.parser.MpqTool

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
