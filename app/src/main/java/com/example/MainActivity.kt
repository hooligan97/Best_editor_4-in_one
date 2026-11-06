package com.example

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.ui.DevilutionXApp
import com.example.ui.theme.MyApplicationTheme
import java.io.File
import java.util.Date

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            val crashFile = File(getExternalFilesDir(null), "crash.txt")
            val logMessage = "${Date()}: Uncaught exception in thread ${thread.name}\n${Log.getStackTraceString(throwable)}\n\n"
            crashFile.appendText(logMessage)
            Log.e("D1SaveBridge", "Crash caught by global handler: ${throwable.message}")
            Runtime.getRuntime().exit(1)
        }

        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                DevilutionXApp()
            }
        }
    }
}
