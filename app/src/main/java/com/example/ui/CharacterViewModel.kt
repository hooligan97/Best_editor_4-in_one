package com.example.ui

import androidx.lifecycle.ViewModel
import android.util.Log
import com.example.data.model.*
import com.example.data.parser.*
import com.example.data.parser.SaveConstants
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

enum class EditorTab(val title: String, val iconLabel: String) {
    HERO("Hero", "Hero Identity"),
    STATS("Stats", "Attributes & Orbs"),
    SPELLS("Spells", "Spellbook"),
    INVENTORY("Inventory", "Equipment & Grid"),
    ARMORY("Armory", "Legendary Catalog"),
    SAVES("Saves & MPQ", "Files & Tools")
}

data class SavedVaultHero(
    val id: String = java.util.UUID.randomUUID().toString(),
    val label: String,
    val character: HeroCharacter,
    val timestamp: String
)

class CharacterViewModel : ViewModel() {

    private val _character = MutableStateFlow(HeroCharacter.createGodly(HeroClass.WARRIOR, "Aidan"))
    private var importedOriginalSave: ByteArray? = null
    private var importedRawHero: ByteArray? = null
    val character: StateFlow<HeroCharacter> = _character.asStateFlow()

    private val _activeTab = MutableStateFlow(EditorTab.HERO)
    val activeTab: StateFlow<EditorTab> = _activeTab.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>("Welcome to DevilutionX Hero Editor")
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    private val _mpqInfo = MutableStateFlow<MpqHeaderInfo?>(null)
    val mpqInfo: StateFlow<MpqHeaderInfo?> = _mpqInfo.asStateFlow()

    private val _hexDump = MutableStateFlow<String?>(null)
    val hexDump: StateFlow<String?> = _hexDump.asStateFlow()

    private val _vault = MutableStateFlow<List<SavedVaultHero>>(
        listOf(
            SavedVaultHero(
                label = "Godly MP Warrior Lv50 (multi_0.sv)",
                character = HeroCharacter.createGodly(HeroClass.WARRIOR, "Sir Aidan").copy(isMultiplayer = true, multiplayerSlot = 0),
                timestamp = "Multiplayer Preset"
            ),
            SavedVaultHero(
                label = "Aragorn (Middle Earth Mod)",
                character = HeroCharacter.createGodly(HeroClass.WARRIOR, "Aragorn").copy(
                    gameMod = GameMod.MIDDLE_EARTH,
                    equipment = ItemArmory.getFullRecommendedLoadout(HeroClass.WARRIOR, GameMod.MIDDLE_EARTH)
                ),
                timestamp = "Middle Earth Preset"
            ),
            SavedVaultHero(
                label = "VKD Berserker Lv60 (VKDMod)",
                character = HeroCharacter.createGodly(HeroClass.BARBARIAN, "Kragor").copy(
                    level = 60,
                    gameMod = GameMod.VKD_MOD,
                    equipment = ItemArmory.getFullRecommendedLoadout(HeroClass.BARBARIAN, GameMod.VKD_MOD)
                ),
                timestamp = "VKDMod Preset"
            ),
            SavedVaultHero(
                label = "Archmage Sorcerer Lv50",
                character = HeroCharacter.createGodly(HeroClass.SORCERER, "Jazreth"),
                timestamp = "Hellfire Preset"
            ),
            SavedVaultHero(
                label = "Shadow Rogue Lv50",
                character = HeroCharacter.createGodly(HeroClass.ROGUE, "Moreina"),
                timestamp = "Classic Preset"
            )
        )
    )
    val vault: StateFlow<List<SavedVaultHero>> = _vault.asStateFlow()

    fun selectTab(tab: EditorTab) {
        _activeTab.value = tab
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }

    fun showMessage(msg: String) {
        _statusMessage.value = msg
    }

    // Hero Identity
    fun updateName(name: String) {
        _character.update { it.copy(name = name.take(15)) }
    }

    fun updateHeroClass(newClass: HeroClass) {
        _character.update { current ->
            current.copy(
                heroClass = newClass,
                strength = newClass.baseStrength.coerceAtLeast(current.strength.coerceAtMost(newClass.maxStrength)),
                magic = newClass.baseMagic.coerceAtLeast(current.magic.coerceAtMost(newClass.maxMagic)),
                dexterity = newClass.baseDexterity.coerceAtLeast(current.dexterity.coerceAtMost(newClass.maxDexterity)),
                vitality = newClass.baseVitality.coerceAtLeast(current.vitality.coerceAtMost(newClass.maxVitality))
            )
        }
        showMessage("Class changed to ${newClass.displayName}")
    }

    fun setGameMod(mod: GameMod) {
        _character.update { current ->
            // If new mod doesn't support current class (e.g. Vanilla with Barbarian), revert to Warrior
            val newClass = if (mod == GameMod.VANILLA_DIABLO && current.heroClass.isHellfire) {
                HeroClass.WARRIOR
            } else {
                current.heroClass
            }
            val newLevel = current.level.coerceIn(1, mod.maxLevel)
            current.copy(
                gameMod = mod,
                heroClass = newClass,
                level = newLevel
            )
        }
        showMessage("Active Mode: ${mod.displayName}")
    }

    fun setIsMultiplayer(isMp: Boolean) {
        _character.update { it.copy(isMultiplayer = isMp) }
        showMessage(if (isMp) "Switched to Multiplayer Character mode (multi_*.sv)" else "Switched to Single Player Character mode (single_*.sv)")
    }

    fun toggleMultiplayer() {
        val next = !_character.value.isMultiplayer
        setIsMultiplayer(next)
    }

    fun setMultiplayerSlot(slot: Int) {
        val clamped = slot.coerceIn(0, 3)
        _character.update { it.copy(multiplayerSlot = clamped) }
        showMessage("Multiplayer Slot set to #$clamped (multi_$clamped.sv)")
    }

    fun setUnlockedDifficulties(nightmare: Boolean, hell: Boolean) {
        _character.update { it.copy(unlockedNightmare = nightmare, unlockedHell = hell) }
        showMessage("Multiplayer difficulty unlocks updated")
    }

    fun equipRecommendedLoadout() {
        val current = _character.value
        val loadout = ItemArmory.getFullRecommendedLoadout(current.heroClass, current.gameMod)
        _character.update { it.copy(equipment = loadout) }
        showMessage("Equipped recommended loadout for ${current.heroClass.displayName} (${loadout.size} items)")
    }

    fun updateLevel(level: Int) {
        val clamped = level.coerceIn(1, _character.value.gameMod.maxLevel)
        val calculatedXp = HeroCharacter.xpForLevel(clamped)
        _character.update { it.copy(level = clamped, experience = calculatedXp) }
        showMessage("Level set to $clamped (XP updated)")
    }

    fun updateExperience(xp: Long) {
        val clampedXp = xp.coerceIn(0L, 2_000_000_000L)
        val derivedLvl = HeroCharacter.levelForXp(clampedXp)
        _character.update { it.copy(experience = clampedXp, level = derivedLvl) }
    }

    fun updateGold(gold: Long) {
        val clamped = gold.coerceIn(0L, 999_999L)
        _character.update { it.copy(gold = clamped) }
    }

    fun updateDifficulty(diff: String) {
        _character.update { it.copy(difficulty = diff) }
    }

    fun updateDungeonLevel(floor: Int) {
        _character.update { it.copy(dungeonLevel = floor.coerceIn(0, 24)) }
    }

    fun createNewCharacter(heroClass: HeroClass, name: String, mod: GameMod) {
        val newChar = HeroCharacter.createStarter(heroClass, name).copy(gameMod = mod)
        _character.value = newChar
        showMessage("Created new ${heroClass.displayName} for ${mod.displayName}")
    }

    // Stats
    fun modifyStat(stat: String, delta: Int) {
        _character.update { c ->
            when (stat.lowercase()) {
                "strength", "str" -> {
                    val newVal = (c.strength + delta).coerceIn(0, 300)
                    c.copy(strength = newVal, baseStrength = newVal)
                }
                "magic", "mag" -> {
                    val newVal = (c.magic + delta).coerceIn(0, 300)
                    c.copy(magic = newVal, baseMagic = newVal)
                }
                "dexterity", "dex" -> {
                    val newVal = (c.dexterity + delta).coerceIn(0, 300)
                    c.copy(dexterity = newVal, baseDexterity = newVal)
                }
                "vitality", "vit" -> {
                    val newVal = (c.vitality + delta).coerceIn(0, 300)
                    c.copy(vitality = newVal, baseVitality = newVal)
                }
                "points", "statpoints" -> {
                    val newVal = (c.statPoints + delta).coerceIn(0, 999)
                    c.copy(statPoints = newVal)
                }
                else -> c
            }
        }
    }

    fun setStatValue(stat: String, value: Int) {
        _character.update { c ->
            when (stat.lowercase()) {
                "strength", "str" -> {
                    val newVal = value.coerceIn(0, 300)
                    c.copy(strength = newVal, baseStrength = newVal)
                }
                "magic", "mag" -> {
                    val newVal = value.coerceIn(0, 300)
                    c.copy(magic = newVal, baseMagic = newVal)
                }
                "dexterity", "dex" -> {
                    val newVal = value.coerceIn(0, 300)
                    c.copy(dexterity = newVal, baseDexterity = newVal)
                }
                "vitality", "vit" -> {
                    val newVal = value.coerceIn(0, 300)
                    c.copy(vitality = newVal, baseVitality = newVal)
                }
                "points", "statpoints" -> {
                    val newVal = value.coerceIn(0, 999)
                    c.copy(statPoints = newVal)
                }
                else -> c
            }
        }
    }

    fun updateLife(current: Int, max: Int) {
        _character.update {
            val c = current.coerceIn(1, 1500)
            val m = max.coerceIn(1, 1500)
            it.copy(life = c, maxLife = m, baseLife = m)
        }
    }

    fun updateMana(current: Int, max: Int) {
        _character.update {
            val c = current.coerceIn(0, 1500)
            val m = max.coerceIn(0, 1500)
            it.copy(mana = c, maxMana = m, baseMana = m)
        }
    }

    fun toggleManaShield() {
        _character.update { it.copy(manaShieldActive = !it.manaShieldActive) }
        showMessage("Mana Shield ${_character.value.manaShieldActive.let { if (it) "Activated" else "Deactivated" }}")
    }

    // Spells
    fun setSpellLevel(spellId: String, level: Int) {
        _character.update { current ->
            val updated = current.spellLevels.toMutableMap()
            if (level <= 0) {
                updated.remove(spellId)
            } else {
                updated[spellId] = level.coerceIn(1, 15)
            }
            current.copy(spellLevels = updated)
        }
    }

    // Cheats / Quick Enhancements
    fun maxAllSpells() {
        val allSpells = DiabloSpellsCatalog.ALL_SPELLS.associate { it.id to 15 }
        _character.update { it.copy(spellLevels = allSpells) }
        showMessage("All 31 Diablo & Hellfire Spells set to Level 15!")
    }

    fun maxOutAllStats() {
        _character.update { c ->
            val cls = c.heroClass
            c.copy(
                strength = cls.maxStrength,
                baseStrength = cls.maxStrength,
                magic = cls.maxMagic,
                baseMagic = cls.maxMagic,
                dexterity = cls.maxDexterity,
                baseDexterity = cls.maxDexterity,
                vitality = cls.maxVitality,
                baseVitality = cls.maxVitality,
                statPoints = 25
            )
        }
        showMessage("Stats maxed out to class limits (${_character.value.heroClass.displayName})!")
    }

    fun maxGold() {
        _character.update { it.copy(gold = 999_999L) }
        showMessage("Gold set to 999,999!")
    }

    fun fullHeal() {
        _character.update { it.copy(life = it.maxLife, mana = it.maxMana) }
        showMessage("Hit Points and Mana fully restored!")
    }

    // Equipment & Inventory
    fun equipItem(slot: EquipSlot, item: DiabloItem) {
        _character.update { current ->
            val newEquipment = current.equipment.toMutableMap()
            newEquipment[slot] = item
            current.copy(equipment = newEquipment)
        }
        showMessage("Equipped ${item.fullTitle} in ${slot.displayName}")
    }

    fun unequipItem(slot: EquipSlot) {
        _character.update { current ->
            val item = current.equipment[slot]
            if (item != null) {
                val newEquipment = current.equipment.toMutableMap()
                newEquipment.remove(slot)
                val newInventory = current.inventory.toMutableList()
                newInventory.add(item)
                current.copy(equipment = newEquipment, inventory = newInventory)
            } else {
                current
            }
        }
        showMessage("Unequipped ${slot.displayName} to backpack")
    }

    fun addItemToInventory(item: DiabloItem) {
        _character.update { current ->
            if (current.inventory.size < 40) {
                current.copy(inventory = current.inventory + item)
            } else {
                current
            }
        }
        showMessage("Added ${item.fullTitle} to Backpack")
    }

    fun removeItemFromInventory(itemId: String) {
        _character.update { current ->
            current.copy(inventory = current.inventory.filterNot { it.id == itemId })
        }
        showMessage("Item removed from Backpack")
    }

    fun setBeltSlot(index: Int, item: DiabloItem?) {
        if (index in 0..7) {
            _character.update { current ->
                val newBelt = current.belt.toMutableList()
                newBelt[index] = item
                current.copy(belt = newBelt)
            }
        }
    }

    // Save & Load (Noctonic JSON & DevilutionX MPQ)
    fun importNoctonicJson(jsonStr: String): Boolean {
        return try {
            val loaded = NoctonicJsonParser.fromJson(jsonStr)
            _character.value = loaded
            showMessage("Successfully imported character: ${loaded.name} (Lv ${loaded.level} ${loaded.heroClass.displayName})")
            true
        } catch (e: Exception) {
            showMessage("JSON Parse error: ${e.message}")
            false
        }
    }

    fun getNoctonicJson(): String {
        return NoctonicJsonParser.toJson(_character.value)
    }

    
    fun importSaveBytes(bytes: ByteArray, filename: String): Boolean {
        Log.d("D1SaveBridge", "Importing save: $filename, size: ${bytes.size}")
        var stagedArchive: File? = null
        return try {
            val lower = filename.lowercase()
            val extension = if (lower.endsWith(".${SaveConstants.HELLFIRE_EXTENSION}")) SaveConstants.HELLFIRE_EXTENSION else SaveConstants.STANDARD_EXTENSION

            stagedArchive = File.createTempFile(SaveConstants.TEMP_FILE_PREFIX, ".$extension")
            stagedArchive.writeBytes(bytes)

            var isMultiplayer = lower.contains("multi") || lower.contains(SaveConstants.MULTIPLAYER_PREFIX.replace("_", ""))
            var isHellfire = extension == SaveConstants.HELLFIRE_EXTENSION || lower.contains("hellfire") || lower.contains("hf")
            var isSpawn = lower.contains("spawn")

            Log.d("D1SaveBridge", "Flags: multi=$isMultiplayer hellfire=$isHellfire spawn=$isSpawn")

            var rawHero = tryReadHero(stagedArchive.absolutePath, isMultiplayer, isSpawn, isHellfire)

            if (rawHero == null || rawHero.isEmpty()) {
                Log.w("D1SaveBridge", "First attempt failed, retrying with flipped flags")
                rawHero = tryReadHero(stagedArchive.absolutePath, !isMultiplayer, isSpawn, !isHellfire)
                if (rawHero != null && rawHero.isNotEmpty()) {
                    isMultiplayer = !isMultiplayer
                    isHellfire = !isHellfire
                }
            }

            if (rawHero != null && rawHero.isNotEmpty()) {
                importedOriginalSave = bytes.copyOf()
                importedRawHero = rawHero.copyOf()
                val parsedHero = parseNativePlayerPack(rawHero).copy(
                    isMultiplayer = isMultiplayer,
                    gameMod = if (isHellfire) GameMod.HELLFIRE else _character.value.gameMod
                ) 
                _character.value = parsedHero
                showMessage("Successfully imported $filename")
                true
            } else {
                showMessage("Import failed: No hero data found")
                false
            }
        } catch (e: Exception) {
            Log.e("D1", "Err: ${e.message}", e)
            showMessage("Import error: ${e.message}")
            false
        } finally {
            stagedArchive?.delete()
        }
    }

    private fun tryReadHero(path: String, multiplayer: Boolean, spawn: Boolean, hellfire: Boolean): ByteArray? {
        return try {
            NativeSaveBridge.readHero(path, multiplayer, spawn, hellfire, hellfire)
        } catch (e: Exception) {
            Log.w("D1SaveBridge", "readHero failed (multi=$multiplayer hf=$hellfire): ${e.message}")
            null
        }
    }
    private fun parseNativePlayerPack(raw: ByteArray): HeroCharacter {
        val buffer = ByteBuffer.wrap(raw).order(ByteOrder.LITTLE_ENDIAN)
        
        if (raw.size < 512) { // Minimal expected PlayerPack size
            Log.e("D1SaveBridge", "Hero payload too small: ${raw.size} bytes")
            return _character.value
        }

        // pName starts at 0x10 (32 bytes)
        val nameBytes = ByteArray(32)
        buffer.position(0x10)
        buffer.get(nameBytes)
        val parsedName = String(nameBytes).substringBefore('\u0000').trim()

        // pClass = 48 (1 byte)
        val classIndex = buffer.get(48).toInt() and 0xFF
        val heroClass = HeroClass.fromIndex(classIndex)

        // pBaseStr = 49 (1 byte), pBaseMag = 50 (1 byte), pBaseDex = 51 (1 byte), pBaseVit = 52 (1 byte)
        val baseStrength = buffer.get(49).toInt() and 0xFF
        val baseMagic = buffer.get(50).toInt() and 0xFF
        val baseDexterity = buffer.get(51).toInt() and 0xFF
        val baseVitality = buffer.get(52).toInt() and 0xFF

        // pLevel = 53 (1 byte), pStatPts = 54 (1 byte)
        val level = buffer.get(53).toInt() and 0xFF
        val statPoints = buffer.get(54).toInt() and 0xFF

        // pExperience = 55 (4 bytes)
        val experience = buffer.getInt(55).toLong() and 0xFFFFFFFFL

        // pGold = 59 (4 bytes)
        val gold = buffer.getInt(59).toLong() and 0xFFFFFFFFL

        // pHPBase = 63 (4 bytes)
        val rawHpBase = buffer.getInt(63)
        // pMaxHPBase = 67 (4 bytes)
        val rawMaxHp = buffer.getInt(67)
        // pManaBase = 71 (4 bytes)
        val rawManaBase = buffer.getInt(71)
        // pMaxManaBase = 75 (4 bytes)
        val rawMaxMana = buffer.getInt(75)

        val currentHp = (rawHpBase / 64).coerceAtLeast(1)
        val maxHp = (rawMaxHp / 64).coerceAtLeast(1)
        val currentMana = (rawManaBase / 64).coerceAtLeast(0)
        val maxMana = (rawMaxMana / 64).coerceAtLeast(0)

        // Helper to parse ItemPack from buffer
        fun parseItem(offset: Int): DiabloItem? {
            if (offset + 20 > raw.size) return null
            val iSeed = buffer.getInt(offset)
            if (iSeed == 0) return null // Empty slot
            val idx = buffer.getShort(offset + 6).toInt() and 0xFFFF
            
            return ItemArmory.FULL_ITEM_LIBRARY.getOrNull(idx % ItemArmory.FULL_ITEM_LIBRARY.size) ?: 
                DiabloItem(
                    name = "Unknown Item ($idx)",
                    baseType = "Unknown",
                    durability = buffer.get(offset + 9).toInt() and 0xFF,
                    maxDurability = buffer.get(offset + 10).toInt() and 0xFF
                )
        }
        
        val equipment = mutableMapOf<EquipSlot, DiabloItem>()
        val slots = arrayOf(
            EquipSlot.HEAD, EquipSlot.NECK, EquipSlot.TORSO, 
            EquipSlot.LEFT_HAND, EquipSlot.RIGHT_HAND, 
            EquipSlot.LEFT_RING, EquipSlot.RIGHT_RING
        )
        // InvBody is at 0x90 in PlayerPack
        for (i in slots.indices) {
            parseItem(0x90 + i * 20)?.let { equipment[slots[i]] = it }
        }

        val inventory = mutableListOf<DiabloItem>()
        // InvList is at 0x90 + 7 * 20 = 0x11C
        for (i in 0 until 40) {
            parseItem(0x11C + i * 20)?.let { inventory.add(it) }
        }

        return _character.value.copy(
            name = if (parsedName.isBlank()) "Bezimienny" else parsedName,
            heroClass = heroClass,
            level = level,
            experience = experience,
            gold = gold,
            statPoints = statPoints,
            baseStrength = baseStrength,
            strength = baseStrength,
            baseMagic = baseMagic,
            magic = baseMagic,
            baseDexterity = baseDexterity,
            dexterity = baseDexterity,
            baseVitality = baseVitality,
            vitality = baseVitality,
            life = currentHp,
            maxLife = maxHp,
            baseLife = maxHp,
            mana = currentMana,
            maxMana = maxMana,
            baseMana = maxMana,
            equipment = equipment,
            inventory = inventory
        )
    }

    fun exportSaveMpqBytes(backupDirectory: java.io.File? = null): ByteArray {
        val original = importedOriginalSave
            ?: throw IllegalStateException("No imported MPQ bytes available for native save export.")
        
        val dir = backupDirectory 
            ?: throw IllegalArgumentException("Backup directory is required for native save export.")

        return com.example.data.service.SaveFileService().exportNativeSave(
            originalBytes = original,
            hero = _character.value,
            backupDirectory = java.io.File(dir, "native-save-backups"),
        )
    }

    fun inspectBytes(bytes: ByteArray) {
        val mpq = MpqTool.analyzeMpqHeader(bytes)
        _mpqInfo.value = mpq
        _hexDump.value = MpqTool.formatHexDump(bytes, 32)
    }

    // Vault
    fun saveToVault(label: String) {
        val cleanLabel = if (label.isBlank()) "${_character.value.name} (Lv ${_character.value.level})" else label
        val newVaultItem = SavedVaultHero(
            label = cleanLabel,
            character = _character.value,
            timestamp = "Local Snapshot"
        )
        _vault.update { listOf(newVaultItem) + it }
        showMessage("Saved snapshot \"$cleanLabel\" to Vault")
    }

    fun loadFromVault(vaultItem: SavedVaultHero) {
        _character.value = vaultItem.character
        showMessage("Loaded \"${vaultItem.label}\" from Vault")
    }
}
