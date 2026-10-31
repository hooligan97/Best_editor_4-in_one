package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.CharacterViewModel
import com.example.ui.theme.DemonicGoldBright
import com.example.ui.theme.DiabloSurface
import com.example.ui.theme.NormalWhite

/**
 * Główny panel postaci. Zapis jest delegowany do wywołującego, bo ekran nie
 * zarządza URI docelowego pliku ani wyborem lokalizacji.
 */
@Composable
fun HomeScreen(
    viewModel: CharacterViewModel,
    onSaveChanges: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hero by viewModel.character.collectAsState()

    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(
                modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(hero.name, style = MaterialTheme.typography.headlineMedium,
                    color = DemonicGoldBright, fontWeight = FontWeight.Bold)
                Text("Poziom ${hero.level} • ${hero.heroClass.displayName}",
                    color = NormalWhite, fontSize = 14.sp)
            }
        }
        item {
            Card(modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DiabloSurface)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Szybkie statystyki", color = DemonicGoldBright,
                        fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    StatAdjustRow("Siła", hero.strength) { viewModel.modifyStat("strength", it) }
                    StatAdjustRow("Zręczność", hero.dexterity) { viewModel.modifyStat("dexterity", it) }
                    StatAdjustRow("Witalność", hero.vitality) { viewModel.modifyStat("vitality", it) }
                }
            }
        }
        item {
            Button(onClick = onSaveChanges, modifier = Modifier.fillMaxWidth()) {
                Text("Zapisz zmiany")
            }
        }
    }
}

@Composable
private fun StatAdjustRow(label: String, value: Int, onAdjust: (Int) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, modifier = Modifier.weight(1f), color = NormalWhite)
        IconButton(onClick = { onAdjust(-1) }, enabled = value > 0) {
            Icon(Icons.Default.Remove, contentDescription = "Zmniejsz $label")
        }
        Text(value.toString(), color = NormalWhite, fontWeight = FontWeight.SemiBold)
        IconButton(onClick = { onAdjust(1) }) {
            Icon(Icons.Default.Add, contentDescription = "Zwiększ $label")
        }
    }
}
