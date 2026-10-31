package com.example.ui.util

import android.net.Uri
import java.io.IOException
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

/**
 * A utility Composable that provides a launcher for picking .sv or .json save files
 * using the Android Storage Access Framework (SAF).
 *
 * @param onFileSelected Callback triggered when a file is successfully picked and read.
 * @param onError Callback triggered if file reading fails.
 * @return The ActivityResultLauncher to be called with launch(arrayOf("application/octet-stream", "application/json"))
 */
@Composable
fun rememberSaveFilePicker(
    onFileSelected: (bytes: ByteArray, filename: String) -> Unit,
    onError: (String) -> Unit
): ManagedActivityResultLauncher<Array<String>, Uri?> {
    val context = LocalContext.current

    return rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let {
            runCatching {
                val input = context.contentResolver.openInputStream(it)
                    ?: throw IOException("Nie można otworzyć wybranego pliku.")
                input.use { stream ->
                    // Bound memory use for malformed or unexpectedly large input files.
                    val maxBytes = 64 * 1024 * 1024
                    val output = java.io.ByteArrayOutputStream()
                    val buffer = ByteArray(8 * 1024)
                    var total = 0
                    while (true) {
                        val count = stream.read(buffer)
                        if (count < 0) break
                        total += count
                        if (total > maxBytes) throw IOException("Plik przekracza limit 64 MiB.")
                        output.write(buffer, 0, count)
                    }
                    val bytes = output.toByteArray()
                    val filename = it.lastPathSegment ?: "save.sv"
                    onFileSelected(bytes, filename)
                }
            }.onFailure { e ->
                onError(e.message ?: "Failed to read save file")
            }
        }
    }
}
