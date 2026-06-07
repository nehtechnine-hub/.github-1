Title: Scaffold: LoadAtom Neutron Editor (proot rootfs downloader)

Summary: Adds an Android Studio scaffold for LoadAtom Neutron Editor. The app downloads a minimal Alpine rootfs and a proot binary on first run, then launches a shell in a proot container. Terminal-only UI for v0.1.

Files added: Android project (app/), MainActivity, RootfsInstaller (download/extract), README, .gitignore.

Important: The scaffold uses placeholder URLs for the rootfs zip and proot binaries in app/src/main/java/com/nehtechnine/loadatom/RootfsInstaller.kt. You must host valid artifacts and update those constants before the app can run.

TODOs:
- Host rootfs/proot binaries and replace placeholder URLs.
- Add checksum verification for downloads.
- Integrate a proper pty-based terminal emulator for full interactive experience.
- Add multi-ABI proot binaries and fallback selection.

Testing: Build in Android Studio, run on arm64/armv7 device/emulator, allow first-run download.

License: MIT
