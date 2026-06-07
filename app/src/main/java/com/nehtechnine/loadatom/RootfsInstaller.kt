package com.nehtechnine.loadatom

import android.content.Context
import android.util.Log
import java.io.*
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

object RootfsInstaller {
    private const val TAG = "RootfsInstaller"
    // IMPORTANT: Replace these URLs with a hosted rootfs zip and a proot binary for each ABI.
    // The scaffold uses placeholders. You'll need to host or point to real files.
    private const val ROOTFS_ZIP_URL = "https://example.com/alpine-rootfs-arm64.zip"
    private const val PROOT_URL_ARM64 = "https://example.com/proot-arm64"
    private const val PROOT_URL_ARM7 = "https://example.com/proot-arm7"

    fun ensureRootfs(ctx: Context) {
        val filesDir = ctx.filesDir
        val rootfsDir = File(filesDir, "rootfs")
        val prootFile = File(filesDir, "proot")

        if (!rootfsDir.exists()) {
            // Download and extract rootfs zip
            val zipFile = File(filesDir, "rootfs.zip")
            downloadFile(ROOTFS_ZIP_URL, zipFile)
            unzip(zipFile, rootfsDir)
            zipFile.delete()
        }

        if (!prootFile.exists()) {
            val abi = android.os.Build.SUPPORTED_ABIS.firstOrNull() ?: "arm64-v8a"
            val url = when {
                abi.contains("arm64") -> PROOT_URL_ARM64
                abi.contains("arm") -> PROOT_URL_ARM7
                else -> PROOT_URL_ARM64
            }
            downloadFile(url, prootFile)
            prootFile.setExecutable(true)
        }
    }

    private fun downloadFile(urlStr: String, outFile: File) {
        Log.i(TAG, "Downloading $urlStr -> ${outFile.absolutePath}")
        val url = URL(urlStr)
        val conn = url.openConnection() as HttpURLConnection
        conn.connectTimeout = 15000
        conn.readTimeout = 15000
        conn.requestMethod = "GET"
        conn.doInput = true
        conn.connect()
        if (conn.responseCode != HttpURLConnection.HTTP_OK) {
            throw IOException("Server returned HTTP ${conn.responseCode} ${conn.responseMessage}")
        }
        val input = conn.inputStream
        val output = FileOutputStream(outFile)
        input.copyTo(output)
        output.flush()
        output.close()
        input.close()
        conn.disconnect()
    }

    private fun unzip(zipFile: File, targetDir: File) {
        val buffer = ByteArray(4096)
        ZipInputStream(FileInputStream(zipFile)).use { zis ->
            var ze: ZipEntry? = zis.nextEntry
            while (ze != null) {
                val fileName = ze.name
                val newFile = File(targetDir, fileName)
                if (ze.isDirectory) {
                    newFile.mkdirs()
                } else {
                    newFile.parentFile?.mkdirs()
                    FileOutputStream(newFile).use { fos ->
                        var len: Int
                        while (zis.read(buffer).also { len = it } > 0) {
                            fos.write(buffer, 0, len)
                        }
                    }
                }
                ze = zis.nextEntry
            }
            zis.closeEntry()
        }
    }
}
