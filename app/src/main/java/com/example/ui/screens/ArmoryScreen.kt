package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.CharacterViewModel
import com.example.ui.components.GothicCard
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArmoryScreen(
    viewModel: CharacterViewModel,
    modifier: Modifier = Modifier
) {
    val hero by viewModel.character.collectAsState()
    var selectedCategory by remember { mutableStateOf("All") }
    var selectedModFilter by remember { mutableStateOf<GameMod?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    val categories = listOf("All", "Weapons", "Armor", "Helms", "Shields", "Jewelry", "Consumables", "Middle Earth", "VKDMod")

    // 2-3 Proposed items per slot for current class & mod
    val proposedBySlot = remember(hero.heroClass, hero.gameMod) {
        ItemArmory.getProposedItemsForClassBySlot(hero.heroClass, hero.gameMod)
    }

    val filteredItems = remember(selectedCategory, selectedModFilter, searchQuery, hero.heroClass) {
        ItemArmory.FULL_ITEM_LIBRARY.filter { item ->
            val matchCat = when (selectedCategory) {
                "Weapons" -> item.baseType.contains("Sword", true) || item.baseType.contains("Bow", true) ||
                        item.baseType.contains("Staff", true) || item.baseType.contains("Axe", true) ||
                        item.baseType.contains("Mace", true) || item.baseType.contains("Hammer", true) ||
                        item.baseType.contains("Cleaver", true) || item.baseType.contains("Blade", true) ||
                        item.baseType.contains("Dagger", true)
                "Armor" -> item.baseType.contains("Mail", true) || item.baseType.contains("Plate", true) ||
                        item.baseType.contains("Leather", true) || item.baseType.contains("Cloak", true) ||
                        item.baseType.contains("Robe", true)
                "Helms" -> item.baseType.contains("Helm", true) || item.baseType.contains("Cap", true) ||
                        item.baseType.contains("Crown", true) || item.baseType.contains("Hood", true)
                "Shields" -> item.baseType.contains("Shield", true) || item.baseType.contains("Buckler", true) ||
                        item.baseType.contains("Bulwark", true)
                "Jewelry" -> item.baseType.contains("Ring", true) || item.baseType.contains("Amulet", true) ||
                        item.baseType.contains("Phial", true)
                "Consumables" -> item.baseType.contains("Potion", true) || item.baseType.contains("Scroll", true) ||
                        item.baseType.contains("Oil", true) || item.baseType.contains("Rune", true)
                "Middle Earth" -> item.modOrigin == GameMod.MIDDLE_EARTH
                "VKDMod" -> item.modOrigin == GameMod.VKD_MOD
                else -> true
            }

            val matchMod = if (selectedModFilter == null) true else item.modOrigin == selectedModFilter

            val matchSearch = searchQuery.isBlank() ||
                    item.name.contains(searchQuery, true) ||
                    item.fullTitle.contains(searchQuery, true) ||
                    item.extraDescription.contains(searchQuery, true) ||
                    item.baseType.contains(searchQuery, true)

            matchCat && matchMod && matchSearch
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(vertical = 16.dp)
    ) {
        // Class Recommendation Banner (PROPOSED ITEMS FOR CURRENT CLASS)
        item {
            GothicCard(
                borderColor = DemonicGoldBright,
                borderWidth = 1.5.dp,
                backgroundColor = DiabloSurfaceVariant
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = DemonicGoldBright, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Proponowane przedmioty dla: ${hero.heroClass.displayName}",
                                color = DemonicGoldBright,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "Dopasowane 2-3 najlepsze przedmioty do każdego slotu dla Twojej klasy w trybie ${hero.gameMod.shortName}",
                            color = BoneGray,
                            fontSize = 11.sp
                        )
                    }

                    FilledTonalButton(
                        onClick = { viewModel.equipRecommendedLoadout() },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = DemonicGoldDark,
                            contentColor = DemonicGoldBright
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier
                            .defaultMinSize(minHeight = 32.dp)
                            .testTag("equip_full_recommended")
                    ) {
                        Icon(Icons.Default.Checklist, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Załóż zestaw", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Proposed items horizontal row per slot
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    listOf(
                        EquipSlot.LEFT_HAND to "Broń (Weapons)",
                        EquipSlot.TORSO to "Zbroje (Armor)",
                        EquipSlot.HEAD to "Hełmy (Helms)",
                        EquipSlot.RIGHT_HAND to "Tarcze (Shields)",
                        EquipSlot.NECK to "Amulety (Amulets)",
                        EquipSlot.LEFT_RING to "Pierścienie (Rings)"
                    ).forEach { (slot, slotLabel) ->
                        val slotProposed = proposedBySlot[slot].orEmpty()
                        if (slotProposed.isNotEmpty()) {
                            Column {
                                Text(
                                    text = slotLabel,
                                    color = DemonicGold,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    items(slotProposed) { pItem ->
                                        ProposedItemMiniCard(
                                            item = pItem,
                                            targetSlot = slot,
                                            onEquip = { viewModel.equipItem(slot, pItem) },
                                            onToBackpack = { viewModel.addItemToInventory(pItem) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Full Items Catalog Header & Search
        item {
            GothicCard(borderColor = DemonicGold) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Shield, contentDescription = null, tint = DemonicGoldBright)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Pełna Biblioteka Przedmiotów", color = DemonicGoldBright, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                    }
                    Badge(containerColor = DiabloSurfaceElevated, contentColor = DemonicGold) {
                        Text("${filteredItems.size} items", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Przeglądaj unikalne i magiczne przedmioty z Diablo 1, Hellfire oraz modów VKDMod i Middle Earth.",
                    color = BoneGray,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Szukaj (np. Grandfather, Whale, Narsil, One Ring)") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = BoneGray) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = DemonicGold,
                        unfocusedBorderColor = DarkBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Categories chips
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(categories) { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(cat) },
                            colors = FilterChipDefaults.filterChipColors(selectedContainerColor = DemonicGoldDark)
                        )
                    }
                }
            }
        }

        // Full Items List
        items(filteredItems, key = { it.id + it.name }) { item ->
            val qColor = when (item.quality) {
                ItemQuality.UNIQUE -> UniqueGold
                ItemQuality.MAGIC -> MagicBlue
                ItemQuality.NORMAL -> NormalWhite
            }

            GothicCard(borderColor = qColor.copy(alpha = 0.5f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = item.fullTitle,
                                color = qColor,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            if (item.modOrigin.isMod) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = BloodRedDark
                                ) {
                                    Text(
                                        text = item.modOrigin.shortName,
                                        fontSize = 9.sp,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                        }

                        Text(
                            text = "${item.quality.displayName} • ${item.baseType}${if (item.modOrigin != GameMod.VANILLA_DIABLO) " • [${item.modOrigin.shortName}]" else ""}",
                            color = BoneGray,
                            fontSize = 11.sp
                        )
                    }

                    Badge(containerColor = DiabloSurfaceElevated, contentColor = qColor) {
                        Text(item.quality.displayName, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Stats breakdown
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    if (item.armorClass > 0) {
                        Text("Armor Class: ${item.armorClass}", color = NormalWhite, fontSize = 12.sp)
                    }
                    if (item.minDamage > 0 || item.maxDamage > 0) {
                        Text("Damage: ${item.minDamage} - ${item.maxDamage} (+${item.damageBonus}%)", color = NormalWhite, fontSize = 12.sp)
                    }
                    if (item.toHitBonus > 0) {
                        Text("To Hit: +${item.toHitBonus}%", color = NormalWhite, fontSize = 12.sp)
                    }
                    if (item.allAttributesBonus > 0) {
                        Text("+${item.allAttributesBonus} to All Attributes", color = DemonicGoldBright, fontSize = 12.sp)
                    }
                    if (item.hitPointsBonus != 0) {
                        Text("${if (item.hitPointsBonus > 0) "+" else ""}${item.hitPointsBonus} Hit Points", color = BloodRedBright, fontSize = 12.sp)
                    }
                    if (item.manaBonus != 0) {
                        Text("${if (item.manaBonus > 0) "+" else ""}${item.manaBonus} Mana", color = ArcaneBlueBright, fontSize = 12.sp)
                    }
                    if (item.fireResist > 0 || item.lightningResist > 0 || item.magicResist > 0) {
                        Text("Resists: Fire +${item.fireResist}% / Light +${item.lightningResist}% / Magic +${item.magicResist}%", color = ArcaneBlueBright, fontSize = 12.sp)
                    }
                    if (item.extraDescription.isNotBlank()) {
                        Text(item.extraDescription, color = DemonicGold, fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val targetSlot = item.inferredSlot

                    if (targetSlot != null) {
                        FilledTonalButton(
                            onClick = { viewModel.equipItem(targetSlot, item) },
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = DiabloSurfaceElevated,
                                contentColor = DemonicGoldBright
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("equip_${item.name.replace(" ", "_").lowercase()}")
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(15.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Załóż (${targetSlot.shortLabel})", fontSize = 11.sp)
                        }
                    }

                    OutlinedButton(
                        onClick = { viewModel.addItemToInventory(item) },
                        border = BorderStroke(1.dp, DarkBorder),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("add_backpack_${item.name.replace(" ", "_").lowercase()}")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Do plecaka", fontSize = 11.sp, color = NormalWhite)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProposedItemMiniCard(
    item: DiabloItem,
    targetSlot: EquipSlot,
    onEquip: () -> Unit,
    onToBackpack: () -> Unit
) {
    val qColor = when (item.quality) {
        ItemQuality.UNIQUE -> UniqueGold
        ItemQuality.MAGIC -> MagicBlue
        ItemQuality.NORMAL -> NormalWhite
    }

    Card(
        modifier = Modifier
            .width(180.dp)
            .padding(vertical = 2.dp),
        colors = CardDefaults.cardColors(containerColor = DiabloSurfaceElevated),
        border = BorderStroke(1.dp, qColor.copy(alpha = 0.6f)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = item.name,
                color = qColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1
            )
            Text(
                text = item.baseType,
                color = BoneGray,
                fontSize = 10.sp
            )
            if (item.minDamage > 0 || item.maxDamage > 0) {
                Text("Dmg: ${item.minDamage}-${item.maxDamage} (+${item.damageBonus}%)", color = NormalWhite, fontSize = 10.sp)
            } else if (item.armorClass > 0) {
                Text("AC: ${item.armorClass}", color = NormalWhite, fontSize = 10.sp)
            } else if (item.allAttributesBonus > 0) {
                Text("+${item.allAttributesBonus} All Attributes", color = DemonicGoldBright, fontSize = 10.sp)
            }

            Spacer(modifier = Modifier.height(2.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                FilledTonalButton(
                    onClick = onEquip,
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = BloodRedDark,
                        contentColor = Color.White
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = 26.dp)
                ) {
                    Text("Załóż", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = onToBackpack,
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                    border = BorderStroke(1.dp, DarkBorder),
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = 26.dp)
                ) {
                    Text("Plecak", fontSize = 9.sp, color = NormalWhite)
                }
            }
        }
    }
}
