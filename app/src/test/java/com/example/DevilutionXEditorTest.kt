package com.example

import com.example.data.model.*
import com.example.data.parser.DevilutionXSaveParser
import com.example.data.parser.MpqTool
import com.example.data.parser.NoctonicJsonParser
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class DevilutionXEditorTest {

    @Test
    fun testLevelAndXpProgression() {
        val level1Xp = HeroCharacter.xpForLevel(1)
        assertEquals(0L, level1Xp)

        val level50Xp = HeroCharacter.xpForLevel(50)
        assertEquals(1413867624L, level50Xp)

        assertEquals(1, HeroCharacter.levelForXp(0L))
        assertEquals(50, HeroCharacter.levelForXp(1413867624L))
        assertEquals(2, HeroCharacter.levelForXp(2500L))
    }

    @Test
    fun testNoctonicJsonRoundTrip() {
        val hero = HeroCharacter.createGodly(HeroClass.SORCERER, "MageGod").copy(
            isMultiplayer = true,
            multiplayerSlot = 1,
            gameMod = GameMod.MIDDLE_EARTH
        )
        val json = NoctonicJsonParser.toJson(hero)

        assertTrue(json.contains("\"name\": \"MageGod\""))
        assertTrue(json.contains("\"class\": \"Sorcerer\""))
        assertTrue(json.contains("\"level\": 50"))
        assertTrue(json.contains("\"isMultiplayer\": true"))
        assertTrue(json.contains("\"gameMod\": \"MIDDLE_EARTH\""))

        val parsed = NoctonicJsonParser.fromJson(json)
        assertEquals("MageGod", parsed.name)
        assertEquals(HeroClass.SORCERER, parsed.heroClass)
        assertEquals(50, parsed.level)
        assertEquals(hero.strength, parsed.strength)
        assertEquals(hero.magic, parsed.magic)
        assertTrue(parsed.isMultiplayer)
        assertEquals(1, parsed.multiplayerSlot)
        assertEquals(GameMod.MIDDLE_EARTH, parsed.gameMod)
    }

    @Test
    fun testDevilutionXSaveStructSerialization() {
        val warrior = HeroCharacter.createGodly(HeroClass.WARRIOR, "Aidan")
        val bytes = DevilutionXSaveParser.serializeToHeroStruct(warrior)

        assertEquals(1280, bytes.size)

        val parsed = DevilutionXSaveParser.parseHeroStruct(bytes)
        assertEquals("Aidan", parsed.name)
        assertEquals(HeroClass.WARRIOR, parsed.heroClass)
        assertEquals(50, parsed.level)
        assertEquals(warrior.strength, parsed.strength)
    }

    @Test
    fun testMultiplayerSaveStructAndFilenameDetection() {
        val mpHero = HeroCharacter.createGodly(HeroClass.WARRIOR, "GondorKnight").copy(
            isMultiplayer = true,
            multiplayerSlot = 2,
            gameMod = GameMod.MIDDLE_EARTH
        )
        val bytes = DevilutionXSaveParser.serializeToHeroStruct(mpHero)
        val parsed = DevilutionXSaveParser.parseHeroStruct(bytes)

        assertTrue(parsed.isMultiplayer)
        assertEquals(2, parsed.multiplayerSlot)
        assertEquals(GameMod.MIDDLE_EARTH, parsed.gameMod)

        // Test filename fallback detection
        val rawBytes = DevilutionXSaveParser.serializeToHeroStruct(HeroCharacter(name = "TestSP"))
        val parsedFromFilename = DevilutionXSaveParser.parseSaveBytes(rawBytes, "multi_1.sv")
        assertTrue(parsedFromFilename.isMultiplayer)

        val parsedHellfire = DevilutionXSaveParser.parseSaveBytes(rawBytes, "multi_0.hsv")
        assertTrue(parsedHellfire.isMultiplayer)
        assertEquals(GameMod.HELLFIRE, parsedHellfire.gameMod)
    }

    @Test
    fun testMpqHeaderGenerationAndAnalysis() {
        val hero = HeroCharacter.createGodly(HeroClass.ROGUE, "Moreina")
        val mpqArchive = DevilutionXSaveParser.createSaveFileMpq(hero)

        assertTrue(mpqArchive.size > 32)
        val info = MpqTool.analyzeMpqHeader(mpqArchive)

        assertTrue(info.isValidMpq)
        assertEquals("MPQ\\x1a", info.signature)
        assertEquals(32, info.headerSize)
        assertTrue(info.archiveSize > 0)
    }

    @Test
    fun testFullItemLibraryAndClassRecommendations() {
        // Verify expansive library
        assertTrue(ItemArmory.FULL_ITEM_LIBRARY.size >= 40)

        // Verify mod items exist
        val oneRing = ItemArmory.FULL_ITEM_LIBRARY.find { it.name == "The One Ring" }
        assertNotNull(oneRing)
        assertEquals(GameMod.MIDDLE_EARTH, oneRing?.modOrigin)

        val vkdCrusher = ItemArmory.FULL_ITEM_LIBRARY.find { it.name == "VKD Ancient Crusher" }
        assertNotNull(vkdCrusher)
        assertEquals(GameMod.VKD_MOD, vkdCrusher?.modOrigin)

        // Test proposed items per class (2 to 3 items per slot)
        HeroClass.entries.forEach { cls ->
            val proposed = ItemArmory.getProposedItemsForClassBySlot(cls, GameMod.HELLFIRE)
            assertTrue("Expected proposed weapons for ${cls.displayName}", proposed[EquipSlot.LEFT_HAND]?.isNotEmpty() == true)
            assertTrue("Expected 1-3 items for ${cls.displayName} weapon slot", proposed[EquipSlot.LEFT_HAND]!!.size in 1..3)
            assertTrue("Expected proposed armor for ${cls.displayName}", proposed[EquipSlot.TORSO]?.isNotEmpty() == true)
            assertTrue("Expected proposed helms for ${cls.displayName}", proposed[EquipSlot.HEAD]?.isNotEmpty() == true)

            val fullLoadout = ItemArmory.getFullRecommendedLoadout(cls, GameMod.HELLFIRE)
            assertTrue("Expected loadout to have head", fullLoadout.containsKey(EquipSlot.HEAD))
            assertTrue("Expected loadout to have torso", fullLoadout.containsKey(EquipSlot.TORSO))
            assertTrue("Expected loadout to have left hand", fullLoadout.containsKey(EquipSlot.LEFT_HAND))
        }
    }
}
