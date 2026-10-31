package com.example.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.io.IOException
import androidx.activity.compose.BackHandler
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.GameMod
import com.example.ui.screens.*
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DevilutionXApp(
    viewModel: CharacterViewModel = viewModel()
) {
    val context = LocalContext.current
    val saveLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/octet-stream")) { uri: Uri? ->
        if (uri != null) {
            runCatching {
                val bytes = viewModel.exportSaveMpqBytes()
                val output = context.contentResolver.openOutputStream(uri)
                    ?: throw IOException("Unable to open destination document for writing.")
                output.use { it.write(bytes) }
            }.onSuccess { viewModel.showMessage("Save exported.") }
                .onFailure { viewModel.showMessage("Save failed: ${it.message}") }
        }
    }
    val hero by viewModel.character.collectAsState()
    val activeTab by viewModel.activeTab.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    var showModMenu by remember { mutableStateOf(false) }

    LaunchedEffect(statusMessage) {
        statusMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg, duration = SnackbarDuration.Short)
            viewModel.clearStatusMessage()
        }
    }

    // BackHandler to navigate back to HERO tab if on a secondary tab
    BackHandler(enabled = activeTab != EditorTab.HERO) {
        viewModel.selectTab(EditorTab.HERO)
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(DiabloBackground),
        containerColor = DiabloBackground,
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "DevilutionX Editor",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = DemonicGoldBright
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            // Multiplayer badge
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (hero.isMultiplayer) BloodRedDark else DiabloSurfaceElevated,
                                modifier = Modifier.clickable { viewModel.toggleMultiplayer() }
                            ) {
                                Text(
                                    text = if (hero.isMultiplayer) "MP Slot #${hero.multiplayerSlot}" else "SP",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (hero.isMultiplayer) Color.White else BoneGray,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${hero.name} • Lv ${hero.level} ${hero.heroClass.displayName} • ${hero.gold}g",
                                fontSize = 11.sp,
                                color = BoneGray
                            )
                        }
                    }
                },
                actions = {
                    // Mod switcher button
                    Box {
                        FilledTonalButton(
                            onClick = { showModMenu = true },
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = if (hero.gameMod.isMod) BloodRedDark else DiabloSurfaceElevated,
                                contentColor = DemonicGoldBright
                            ),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier
                                .defaultMinSize(minHeight = 32.dp)
                                .testTag("top_bar_mod_switch")
                        ) {
                            Text(
                                text = hero.gameMod.shortName,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(
                                Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = showModMenu,
                            onDismissRequest = { showModMenu = false },
                            modifier = Modifier.background(DiabloSurfaceElevated)
                        ) {
                            GameMod.entries.forEach { mod ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(
                                                text = mod.displayName,
                                                fontWeight = if (hero.gameMod == mod) FontWeight.Bold else FontWeight.Normal,
                                                color = if (hero.gameMod == mod) DemonicGoldBright else NormalWhite,
                                                fontSize = 13.sp
                                            )
                                            Text(
                                                text = mod.subtitle,
                                                color = BoneGray,
                                                fontSize = 10.sp
                                            )
                                        }
                                    },
                                    onClick = {
                                        viewModel.setGameMod(mod)
                                        showModMenu = false
                                    },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = when (mod) {
                                                GameMod.VANILLA_DIABLO -> Icons.Default.Shield
                                                GameMod.HELLFIRE -> Icons.Default.Whatshot
                                                GameMod.VKD_MOD -> Icons.Default.AutoFixHigh
                                                GameMod.MIDDLE_EARTH -> Icons.Default.Diamond
                                            },
                                            contentDescription = null,
                                            tint = if (hero.gameMod == mod) DemonicGoldBright else BoneGray
                                        )
                                    }
                                )
                            }
                        }
                    }

                    IconButton(
                        onClick = { viewModel.fullHeal() },
                        modifier = Modifier.testTag("top_bar_heal")
                    ) {
                        Icon(Icons.Default.Healing, contentDescription = "Full Rejuvenate", tint = BloodRedBright)
                    }

                    IconButton(
                        onClick = {
                            val clip = ClipData.newPlainText("Noctonic JSON", viewModel.getNoctonicJson())
                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cm.setPrimaryClip(clip)
                            viewModel.showMessage("Noctonic JSON copied to clipboard!")
                        },
                        modifier = Modifier.testTag("top_bar_copy_json")
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "Copy JSON", tint = DemonicGoldBright)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DiabloSurface,
                    titleContentColor = DemonicGoldBright
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = DiabloSurface,
                contentColor = DemonicGold,
                windowInsets = WindowInsets.navigationBars,
                modifier = Modifier.testTag("bottom_nav_bar")
            ) {
                EditorTab.entries.forEach { tab ->
                    val isSelected = activeTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.selectTab(tab) },
                        icon = {
                            Icon(
                                imageVector = when (tab) {
                                    EditorTab.HERO -> Icons.Default.Person
                                    EditorTab.STATS -> Icons.Default.FitnessCenter
                                    EditorTab.SPELLS -> Icons.Default.MenuBook
                                    EditorTab.INVENTORY -> Icons.Default.Inventory2
                                    EditorTab.ARMORY -> Icons.Default.Shield
                                    EditorTab.SAVES -> Icons.Default.FolderSpecial
                                },
                                contentDescription = tab.title,
                                tint = if (isSelected) DemonicGoldBright else BoneGray
                            )
                        },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) DemonicGoldBright else BoneGray
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DemonicGoldBright,
                            selectedTextColor = DemonicGoldBright,
                            unselectedIconColor = BoneGray,
                            unselectedTextColor = BoneGray,
                            indicatorColor = BloodRedDark
                        ),
                        modifier = Modifier.testTag("nav_item_${tab.name.lowercase()}")
                    )
                }
            }
        },
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    containerColor = DiabloSurfaceElevated,
                    contentColor = NormalWhite,
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text(data.visuals.message, fontSize = 13.sp)
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Crossfade(targetState = activeTab, label = "TabSwitch") { tab ->
                when (tab) {
                    EditorTab.HERO -> HomeScreen(viewModel = viewModel, onSaveChanges = { saveLauncher.launch("${hero.name.take(15)}.${hero.gameMod.defaultSaveExtension}") })
                    EditorTab.STATS -> StatsScreen(viewModel = viewModel)
                    EditorTab.SPELLS -> SpellbookScreen(viewModel = viewModel)
                    EditorTab.INVENTORY -> InventoryScreen(viewModel = viewModel)
                    EditorTab.ARMORY -> ArmoryScreen(viewModel = viewModel)
                    EditorTab.SAVES -> SaveManagerScreen(viewModel = viewModel)
                }
            }
        }
    }
}
