package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.GameMod
import com.example.ui.CharacterViewModel
import com.example.ui.components.GothicCard
import com.example.ui.theme.*

@Composable
fun SaveManagerScreen(
    viewModel: CharacterViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val hero by viewModel.character.collectAsState()
    val mpqInfo by viewModel.mpqInfo.collectAsState()
    val hexDump by viewModel.hexDump.collectAsState()
    val vault by viewModel.vault.collectAsState()

    var showJsonDialog by remember { mutableStateOf(false) }
    var jsonInputText by remember { mutableStateOf("") }
    var showSnapshotDialog by remember { mutableStateOf(false) }
    var snapshotLabel by remember { mutableStateOf("") }

    val defaultSaveFilename = remember(hero.isMultiplayer, hero.multiplayerSlot, hero.gameMod) {
        val prefix = if (hero.isMultiplayer) "multi" else "single"
        val ext = hero.gameMod.defaultSaveExtension
        "${prefix}_${hero.multiplayerSlot}.$ext"
    }

    // File Pickers using Storage Access Framework (SAF)
    val openSaveLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            runCatching {
                context.contentResolver.openInputStream(uri)?.use { stream ->
                    val bytes = stream.readBytes()
                    val filename = uri.lastPathSegment ?: "save.sv"
                    if (filename.endsWith(".json", ignoreCase = true) || bytes.take(10).toByteArray().decodeToString().contains("{")) {
                        viewModel.importNoctonicJson(String(bytes))
                    } else {
                        viewModel.importSaveBytes(bytes, filename)
                    }
                }
            }.onFailure {
                viewModel.showMessage("Failed to open file: ${it.message}")
            }
        }
    }

    val createSaveLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/octet-stream")
    ) { uri ->
        if (uri != null) {
            runCatching {
                context.contentResolver.openOutputStream(uri)?.use { stream ->
                    val mpqBytes = viewModel.exportSaveMpqBytes()
                    stream.write(mpqBytes)
                }
                viewModel.showMessage("DevilutionX Save exported successfully (${if (hero.isMultiplayer) "Multiplayer" else "Single Player"})!")
            }.onFailure {
                viewModel.showMessage("Failed to export: ${it.message}")
            }
        }
    }

    val createJsonLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        if (uri != null) {
            runCatching {
                context.contentResolver.openOutputStream(uri)?.use { stream ->
                    val jsonBytes = viewModel.getNoctonicJson().toByteArray(Charsets.UTF_8)
                    stream.write(jsonBytes)
                }
                viewModel.showMessage("Noctonic JSON exported successfully!")
            }.onFailure {
                viewModel.showMessage("Failed to export JSON: ${it.message}")
            }
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(vertical = 16.dp)
    ) {
        // DevilutionX Android Save File Guide
        item {
            GothicCard(borderColor = BloodRedDark) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.FolderSpecial, contentDescription = null, tint = BloodRedBright)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Ścieżki Zapisu DevilutionX (Android & PC)", color = BloodRedBright, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Lokalizacja plików zapisu na urządzeniach Android:\n" +
                            "/Android/data/org.diasurgical.devilutionx/files/\n\n" +
                            "• Single Player Diablo 1: single_0.sv .. single_3.sv\n" +
                            "• Multiplayer Diablo 1: multi_0.sv .. multi_3.sv (lub d1_0.sv)\n" +
                            "• Hellfire Single Player: single_0.hsv .. single_3.hsv\n" +
                            "• Hellfire Multiplayer: multi_0.hsv .. multi_3.hsv (lub hf_0.sv)\n" +
                            "• Modyfikacje VKDMod / Middle Earth Mod korzystają z formatu .sv kompatybilnego z DevilutionX.",
                    color = BoneGray,
                    fontSize = 12.sp,
                    lineHeight = 18.sp
                )
            }
        }

        // Multiplayer Character Target & Format Switcher
        item {
            GothicCard(borderColor = if (hero.isMultiplayer) BloodRedBright else DemonicGoldDark) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Format zapisu postaci", color = DemonicGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = if (hero.isMultiplayer) "Tryb MULTIPLAYER (Wieloosobowy)" else "Tryb SINGLE PLAYER (Jednoosobowy)",
                            color = if (hero.isMultiplayer) BloodRedBright else NormalWhite,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Switch(
                        checked = hero.isMultiplayer,
                        onCheckedChange = { viewModel.setIsMultiplayer(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = BloodRedBright,
                            checkedTrackColor = BloodRedDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Slot selector
                Text("Slot postaci (0 - 3):", color = BoneGray, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    for (s in 0..3) {
                        val isSelected = hero.multiplayerSlot == s
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.setMultiplayerSlot(s) },
                            label = { Text("Slot #$s") },
                            colors = FilterChipDefaults.filterChipColors(selectedContainerColor = BloodRedDark),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = DiabloSurfaceElevated,
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.SaveAs, contentDescription = null, tint = DemonicGoldBright, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Domyślna nazwa pliku: $defaultSaveFilename",
                            color = DemonicGoldBright,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // File Actions (Import / Export)
        item {
            GothicCard(borderColor = DemonicGoldDark) {
                Text("Operacje na plikach zapisu", color = DemonicGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalButton(
                        onClick = { openSaveLauncher.launch(arrayOf("*/*")) },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = DiabloSurfaceElevated,
                            contentColor = DemonicGoldBright
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("open_save_button")
                    ) {
                        Icon(Icons.Default.FileOpen, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Otwórz plik .sv", fontSize = 12.sp)
                    }

                    FilledTonalButton(
                        onClick = { createSaveLauncher.launch(defaultSaveFilename) },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = BloodRedDark,
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("export_sv_button")
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Zapisz $defaultSaveFilename", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Quick export alternatives
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            viewModel.setIsMultiplayer(true)
                            createSaveLauncher.launch("multi_0.sv")
                        },
                        border = BorderStroke(1.dp, BloodRedDark),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("MP Diablo (multi_0.sv)", fontSize = 10.sp, color = BloodRedBright)
                    }

                    OutlinedButton(
                        onClick = {
                            viewModel.setIsMultiplayer(true)
                            viewModel.setGameMod(GameMod.HELLFIRE)
                            createSaveLauncher.launch("multi_0.hsv")
                        },
                        border = BorderStroke(1.dp, BloodRedDark),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("MP Hellfire (multi_0.hsv)", fontSize = 10.sp, color = BloodRedBright)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { createJsonLauncher.launch("${hero.name.lowercase()}_hero.json") },
                        border = BorderStroke(1.dp, DarkBorder),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Eksport JSON", fontSize = 11.sp, color = NormalWhite)
                    }

                    OutlinedButton(
                        onClick = {
                            val clip = ClipData.newPlainText("Noctonic JSON", viewModel.getNoctonicJson())
                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cm.setPrimaryClip(clip)
                            viewModel.showMessage("Skopiowano Noctonic JSON do schowka! (Kompatybilny z noctonic.github.io/diablo)")
                        },
                        border = BorderStroke(1.dp, DemonicGoldDark),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, tint = DemonicGoldBright, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Kopiuj JSON", fontSize = 11.sp, color = DemonicGoldBright)
                    }

                    OutlinedButton(
                        onClick = {
                            jsonInputText = ""
                            showJsonDialog = true
                        },
                        border = BorderStroke(1.dp, ArcaneBlueDark),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Wklej JSON", fontSize = 11.sp, color = ArcaneBlueBright)
                    }
                }
            }
        }

        // MPQ Tools & Hex Inspector
        item {
            GothicCard(borderColor = ArcaneBlueDark) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Memory, contentDescription = null, tint = ArcaneBlueBright)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Archiwum MPQ & Narzędzie Hex", color = ArcaneBlueBright, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }

                    FilledTonalButton(
                        onClick = {
                            val testBytes = viewModel.exportSaveMpqBytes()
                            viewModel.inspectBytes(testBytes)
                            viewModel.showMessage("Przeanalizowano kontener MPQ DevilutionX")
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        modifier = Modifier.defaultMinSize(minHeight = 28.dp)
                    ) {
                        Text("Inspekcja", fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (mpqInfo != null) {
                    val info = mpqInfo!!
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DiabloSurfaceElevated),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Sygnatura: ${info.signature} • ${if (info.isValidMpq) "Prawidłowy kontener MPQ" else "Struktura binarna"}", color = DemonicGoldBright, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("Rozmiar: ${info.archiveSize} bajtów • Nagłówek: ${info.headerSize} bajtów", color = BoneGray, fontSize = 11.sp)
                            Text("Wykryte pliki: ${info.detectedInternalFiles.joinToString(", ")}", color = ArcaneBlueBright, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                }

                if (hexDump != null) {
                    SelectionContainer {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF090605), RoundedCornerShape(6.dp))
                                .padding(8.dp)
                        ) {
                            Text(
                                text = hexDump!!,
                                color = NormalWhite,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp,
                                lineHeight = 13.sp
                            )
                        }
                    }
                } else {
                    Text(
                        text = "Otwórz plik .sv lub kliknij 'Inspekcja', aby przejrzeć nagłówki MPQ i zrzut hex.",
                        color = BoneGray,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Snapshot Vault
        item {
            GothicCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Krypta Kopii Zapasowych (Vault)", color = DemonicGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    IconButton(onClick = {
                        snapshotLabel = "${hero.name} (Lv ${hero.level}${if (hero.isMultiplayer) " MP" else ""})"
                        showSnapshotDialog = true
                    }) {
                        Icon(Icons.Default.AddBox, contentDescription = "Add Snapshot", tint = DemonicGoldBright)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    vault.forEach { item ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = DiabloSurfaceElevated),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(item.label, color = NormalWhite, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                    Text("${item.character.name} • Lv ${item.character.level} ${item.character.heroClass.displayName} [${item.character.gameMod.shortName}] • ${item.timestamp}", color = BoneGray, fontSize = 11.sp)
                                }

                                FilledTonalButton(
                                    onClick = { viewModel.loadFromVault(item) },
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier.defaultMinSize(minHeight = 28.dp)
                                ) {
                                    Text("Wczytaj", fontSize = 11.sp, color = DemonicGoldBright)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Paste Noctonic JSON Dialog
    if (showJsonDialog) {
        AlertDialog(
            onDismissRequest = { showJsonDialog = false },
            containerColor = DiabloSurface,
            title = { Text("Wklej Noctonic DEADitor JSON", color = DemonicGold, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Wklej zawartość JSON wyeksportowaną z noctonic.github.io/diablo:", color = BoneGray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = jsonInputText,
                        onValueChange = { jsonInputText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = DemonicGold,
                            unfocusedBorderColor = DarkBorder
                        ),
                        placeholder = { Text("{\"name\": \"...\", \"class\": \"...\"}") }
                    )
                }
            },
            confirmButton = {
                FilledTonalButton(
                    onClick = {
                        if (viewModel.importNoctonicJson(jsonInputText)) {
                            showJsonDialog = false
                        }
                    },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = DemonicGoldDark)
                ) {
                    Text("Importuj", color = DemonicGoldBright)
                }
            },
            dismissButton = {
                TextButton(onClick = { showJsonDialog = false }) {
                    Text("Anuluj", color = BoneGray)
                }
            }
        )
    }

    // Create Snapshot Dialog
    if (showSnapshotDialog) {
        AlertDialog(
            onDismissRequest = { showSnapshotDialog = false },
            containerColor = DiabloSurface,
            title = { Text("Zapisz kopię w Krypcie", color = DemonicGold, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Podaj etykietę dla tej kopii zapasowej:", color = BoneGray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = snapshotLabel,
                        onValueChange = { snapshotLabel = it },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                FilledTonalButton(
                    onClick = {
                        viewModel.saveToVault(snapshotLabel)
                        showSnapshotDialog = false
                    },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = DemonicGoldDark)
                ) {
                    Text("Zapisz", color = DemonicGoldBright)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSnapshotDialog = false }) {
                    Text("Anuluj", color = BoneGray)
                }
            }
        )
    }
}
