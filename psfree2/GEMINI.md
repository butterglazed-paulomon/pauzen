# PSFree Project Overview

PSFree is a high-reliability WebKit exploit for PlayStation 4 (firmwares 6.00 through 9.60) and PlayStation 5 (firmwares 1.00 through 5.50). It utilizes **CVE-2022-22620**, a Use-After-Free (UAF) vulnerability in `WebCore::SerializedScriptValue`, to gain arbitrary memory read/write primitives within the browser process.

## Project Structure

The project is organized as a web-based exploit host using modern JavaScript (ES Modules).

- **Root Directory**:
  - `index.html`: The main entry point and user interface for the console's web browser.
  - `psfree.mjs`: The core implementation of the WebKit exploit.
  - `config.mjs`: Configuration for target firmware versions (e.g., setting the target to `0x900` for PS4 9.00).
  - `cache.html`: Used for offline caching of the exploit.
  - `makecache.bat`: Windows batch script to generate the `cache.manifest` file for offline usage.
  - `goldhen.bin` / `aio_patches.bin`: Payload binaries often used in conjunction with the exploit.

- **`module/`**: A library of low-level primitives used by the exploit and ROP chains.
  - `mem.mjs`: Core memory management, including `addrof` and `fakeobj` primitives.
  - `int64.mjs`: Support for 64-bit integer operations, essential for handling memory addresses.
  - `rw.mjs`: Arbitrary read/write primitives.
  - `chain.mjs`: Infrastructure for building and executing ROP (Return-Oriented Programming) chains.
  - `memtools.mjs`: Higher-level memory utilities like finding module bases and initializing syscall arrays.
  - `utils.mjs`: General utilities (logging, timing, hex formatting).

- **`rop/`**: Firmware-specific ROP chains and exploit stages.
  - `900.mjs`: ROP chain implementation for PS4 firmware 9.00.

- **`kpatch/`**: Kernel-level patches written in C.
  - Contains source code (`900.c`), headers, and a `Makefile` to compile kernel patches that are executed after the initial WebKit exploit to gain kernel privileges.

- **`AIO_Fix_Temp/`**: Temporary or experimental C source files for asynchronous I/O (AIO) related fixes.

- **`fonts/`**: UI fonts used in the web interface.

## Building and Running

### Hosting the Exploit
To run the exploit, the root directory must be served via a web server.
- **Example (Python)**: `python -m http.server 8080`
- **Example (Node.js)**: `npx serve .`

Once hosted, navigate to the server's IP address on the PlayStation's User's Guide or Web Browser.

### Compiling Kernel Patches
Kernel patches located in the `kpatch/` directory require a C compiler (gcc) and standard build tools.
```bash
cd kpatch
make
```

### Offline Cache Generation
If you modify files and want them to be cached for offline use on the console, run the `makecache.bat` script on a Windows machine:
```cmd
makecache.bat
```
This updates the `cache.manifest` file with the current file list.

## Development Conventions

- **ES Modules**: All JavaScript logic is implemented using `.mjs` files to leverage native ES module support in modern WebKit.
- **Memory Safety**: Extreme care must be taken with the JavaScript Garbage Collector (GC). The exploit often uses "OversizeTypedArray" patterns to avoid GC interference during memory corruption (see `module/memtools.mjs`).
- **Targeting**: Firmware-specific offsets and logic should be gated by the `target` variable defined in `config.mjs`.
- **Licensing**: The project is licensed under the **GNU Affero General Public License v3 (AGPL-3.0)**. All source files should include the appropriate copyright and license header.
