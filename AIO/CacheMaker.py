import os
from datetime import datetime

ALLOWED_EXTS = {'.html', '.css', '.js', '.mjs', '.bin', '.elf', '.ttf', '.png', '.txt'}
EXCLUDED_DIRS = {'.git', '.vscode', 'node_modules', '__pycache__', '.github'}
OUTPUT_FILE = 'PSFree.manifest'

def create_manifest():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(root_dir, OUTPUT_FILE)

    manifest_files = ["./", "index.html", "cache.html", "exploit.html", "about.html"]
    seen = set(manifest_files)

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for f in sorted(filenames):
            ext = os.path.splitext(f)[1].lower()
            if ext not in ALLOWED_EXTS:
                continue
            rel = os.path.relpath(os.path.join(dirpath, f), root_dir).replace('\\', '/')
            if rel not in seen:
                manifest_files.append(rel)
                seen.add(rel)

    content = [
        "CACHE MANIFEST",
        f"# PSFree AIO Unified Cache Manifest",
        f"# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "CACHE:"
    ]
    content.extend(manifest_files)
    content.extend(["", "NETWORK:", "*", ""])

    with open(manifest_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(content))

    print(f"Successfully created {OUTPUT_FILE} with {len(manifest_files)} entries.")

if __name__ == '__main__':
    create_manifest()
