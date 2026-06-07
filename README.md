# LoadAtom Neutron Editor — scaffold

This scaffold creates an Android app that downloads a Linux rootfs and a proot binary on first run and launches a shell inside it.

Important notes (you must complete these before the app will work):

1. Provide a rootfs zip and proot binaries
   - The scaffold references placeholder URLs in app/src/main/java/com/nehtechnine/loadatom/RootfsInstaller.kt:
     - ROOTFS_ZIP_URL
     - PROOT_URL_ARM64
     - PROOT_URL_ARM7
   - Host a zip file containing a minimal rootfs (for example, Alpine minirootfs packed as a zip). The zip should contain the filesystem root entries (bin, lib, etc.).
   - Provide statically-linked proot binaries for the target ABIs and point PROOT_URL_* at them.

2. APK size and bandwidth
   - By choosing "download on first run" the APK stays small. The first run will download the rootfs and proot binaries (~tens of MB).

3. Terminal UI
   - The scaffold implements a very simple terminal UI (TextView + EditText). For a better terminal experience, integrate an Android terminal emulator view (eg. Jackpal's Android-Terminal-Emulator) or Termux's terminal view.

4. Build
   - Open the project in Android Studio (recommended) and build. Ensure your SDK/NDK versions match the Gradle plugin.

5. Improvements / TODOs
   - Add checksum verification for downloaded artifacts.
   - Support multiple ABI proot downloads and extraction.
   - Use a proper pty-based terminal for interactive programs (vim, nano, ssh).

License: MIT
