package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
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
                    StatEditRow("Siła", hero.strength) { viewModel.setStatValue("strength", it) }
                    StatEditRow("Zręczność", hero.dexterity) { viewModel.setStatValue("dexterity", it) }
                    StatEditRow("Witalność", hero.vitality) { viewModel.setStatValue("vitality", it) }
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
private fun StatEditRow(label: String, value: Int, onValueChange: (Int) -> Unit) {
    var text by remember(value) { mutableStateOf(value.toString()) }
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, modifier = Modifier.weight(1f), color = NormalWhite)
        OutlinedTextField(
            value = text,
            onValueChange = {
                text = it
                it.toIntOrNull()?.let { newValue -> onValueChange(newValue) }
            },
            modifier = Modifier.width(80.dp),
            singleLine = true,
            textStyle = TextStyle(color = NormalWhite)
        )
    }
}
