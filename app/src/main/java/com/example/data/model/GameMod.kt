package com.example.data.model

enum class GameMod(
    val id: String,
    val displayName: String,
    val shortName: String,
    val subtitle: String,
    val description: String,
    val defaultSaveExtension: String,
    val maxLevel: Int,
    val isMod: Boolean = false
) {
    VANILLA_DIABLO(
        id = "vanilla",
        displayName = "Diablo 1 (Vanilla)",
        shortName = "Diablo 1",
        subtitle = "Classic 1996 Tristram",
        description = "Original Diablo 1 game with Warrior, Rogue, and Sorcerer. Single and multiplayer hero support.",
        defaultSaveExtension = "sv",
        maxLevel = 50,
        isMod = false
    ),
    HELLFIRE(
        id = "hellfire",
        displayName = "Hellfire Expansion",
        shortName = "Hellfire",
        subtitle = "Sierra 1997 Expansion",
        description = "Adds Monk, Bard, Barbarian, Hive & Crypt dungeon depths, Hellfire spells, runes, and oils.",
        defaultSaveExtension = "hsv",
        maxLevel = 50,
        isMod = false
    ),
    VKD_MOD(
        id = "vkd",
        displayName = "VKDMod Overhaul",
        shortName = "VKDMod",
        subtitle = "DevilutionX Rebalance",
        description = "Enhanced DevilutionX balance mod with high-tier boss drop affixes, level 60 cap, and custom unique armaments.",
        defaultSaveExtension = "sv",
        maxLevel = 60,
        isMod = true
    ),
    MIDDLE_EARTH(
        id = "middle_earth",
        displayName = "Middle Earth Mod",
        shortName = "Middle Earth",
        subtitle = "Lord of the Rings Mod",
        description = "Total conversion mod for DevilutionX featuring LOTR lore, The One Ring, Narsil, Mithril Mail, and Moria depths.",
        defaultSaveExtension = "sv",
        maxLevel = 50,
        isMod = true
    );

    companion object {
        fun fromId(id: String): GameMod {
            return entries.firstOrNull {
                it.id.equals(id, ignoreCase = true) ||
                it.name.equals(id, ignoreCase = true) ||
                it.shortName.equals(id, ignoreCase = true)
            } ?: HELLFIRE
        }
    }
}
