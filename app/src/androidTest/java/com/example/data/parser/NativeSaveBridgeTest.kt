package com.example.data.parser

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertThrows
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NativeSaveBridgeTest {
    @Test
    fun patchFieldRejectsPayloadWithIncorrectSize() {
        assertThrows(IllegalArgumentException::class.java) {
            NativeSaveBridge.patchField(ByteArray(8), "level", 1L)
        }
    }
}
