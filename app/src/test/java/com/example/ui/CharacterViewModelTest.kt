package com.example.ui

import com.example.data.model.GameMod
import org.junit.Assert.assertEquals
import org.junit.Test

class CharacterViewModelTest {
    @Test
    fun vanillaLevelIsClampedToFifty() {
        val viewModel = CharacterViewModel()
        viewModel.setGameMod(GameMod.VANILLA_DIABLO)
        viewModel.updateLevel(60)
        assertEquals(50, viewModel.character.value.level)
    }

    @Test
    fun vkdModLevelAllowsSixtyAndClampsAboveIt() {
        val viewModel = CharacterViewModel()
        viewModel.setGameMod(GameMod.VKD_MOD)
        viewModel.updateLevel(60)
        assertEquals(60, viewModel.character.value.level)
        viewModel.updateLevel(75)
        assertEquals(60, viewModel.character.value.level)
    }

    @Test
    fun levelCannotDropBelowOne() {
        val viewModel = CharacterViewModel()
        viewModel.updateLevel(0)
        assertEquals(1, viewModel.character.value.level)
    }
}
