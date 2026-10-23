package com.example.ui.util

import android.net.Uri
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
                context.contentResolver.openInputStream(it)?.use { stream ->
                    val bytes = stream.readBytes()
                    // Attempt to resolve filename from URI (may be fallback)
                    val filename = it.lastPathSegment ?: "save.sv"
                    onFileSelected(bytes, filename)
                }
            }.onFailure { e ->
                onError(e.message ?: "Failed to read save file")
            }
        }
    }
}
