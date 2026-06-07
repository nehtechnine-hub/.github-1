package com.nehtechnine.loadatom

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.io.*

class MainActivity : AppCompatActivity() {
    private lateinit var output: TextView
    private lateinit var input: EditText
    private lateinit var sendBtn: Button
    private lateinit var scroll: ScrollView

    private var process: Process? = null
    private var processWriter: BufferedWriter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        output = findViewById(R.id.output)
        input = findViewById(R.id.input)
        sendBtn = findViewById(R.id.sendBtn)
        scroll = findViewById(R.id.scroll)

        appendOutput("Preparing rootfs and proot (first run may download ~30-100MB)...\n")

        GlobalScope.launch(Dispatchers.IO) {
            try {
                RootfsInstaller.ensureRootfs(applicationContext)
                appendOutput("Rootfs ready. Launching shell...\n")
                launchProotShell()
            } catch (e: Exception) {
                appendOutput("Error during setup: ${'$'}{e.message}\n")
            }
        }

        sendBtn.setOnClickListener {
            val text = input.text.toString()
            input.setText("")
            sendToProcess(text + "\n")
        }
    }

    private fun appendOutput(s: String) {
        runOnUiThread {
            output.append(s)
            scroll.post { scroll.fullScroll(ScrollView.FOCUS_DOWN) }
        }
    }

    private fun launchProotShell() {
        val filesDir = filesDir
        val proot = File(filesDir, "proot")
        val rootfs = File(filesDir, "rootfs")
        if (!proot.exists() || !rootfs.exists()) {
            appendOutput("Required files missing.\n")
            return
        }
        proot.setExecutable(true)

        val pb = ProcessBuilder(proot.absolutePath, "-S", rootfs.absolutePath, "/bin/sh")
        pb.redirectErrorStream(true)
        process = pb.start()

        processWriter = BufferedWriter(OutputStreamWriter(process!!.outputStream))

        // Read output
        Thread {
            val reader = BufferedReader(InputStreamReader(process!!.inputStream))
            var line: String?
            try {
                while (reader.readLine().also { line = it } != null) {
                    appendOutput(line + "\n")
                }
            } catch (e: IOException) {
                appendOutput("Process output read error: ${'$'}{e.message}\n")
            }
        }.start()

        // Wait for process
        Thread {
            try {
                val rc = process!!.waitFor()
                appendOutput("Shell exited (rc=${'$'}rc)\n")
            } catch (e: InterruptedException) {
                appendOutput("Process was interrupted\n")
            }
        }.start()
    }

    private fun sendToProcess(s: String) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                processWriter?.apply {
                    write(s)
                    flush()
                } ?: run { appendOutput("Shell not ready.\n") }
            } catch (e: IOException) {
                appendOutput("Failed to send input: ${'$'}{e.message}\n")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        process?.destroy()
    }
}
