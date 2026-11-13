package com.example.ui.util

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import java.io.IOException
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

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
                    val filename = resolveDisplayName(context, it)
                    onFileSelected(bytes, filename)
                }
            }.onFailure { e ->
                onError(e.message ?: "Failed to read save file")
            }
        }
    }
}

private fun resolveDisplayName(context: Context, uri: Uri): String {
    context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) {
            val idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (idx >= 0) {
                val name = cursor.getString(idx)
                if (!name.isNullOrBlank()) return name
            }
        }
    }
    return uri.lastPathSegment?.substringAfterLast(':')?.substringAfterLast('/') ?: "save.sv"
}
