import os
from datetime import datetime

ALLOWED_EXTS = {'.html', '.css', '.js', '.mjs', '.bin', '.elf', '.ttf', '.png', '.txt'}
EXCLUDED_DIRS = {'.git', '.vscode', 'node_modules', '__pycache__', '.github'}
OUTPUT_FILES = ['offline.appcache']

def create_manifest():
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Do not include './' or directory paths that cause HTTP 301/302 redirects on GitHub Pages
    manifest_files = ["index.html", "cache.html", "exploit.html", "about.html"]
    seen = set(manifest_files)
    seen_filenames = {'LiberationMono-Regular.ttf'}

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for f in sorted(filenames):
            ext = os.path.splitext(f)[1].lower()
            if ext not in ALLOWED_EXTS:
                continue
            rel = os.path.relpath(os.path.join(dirpath, f), root_dir).replace('\\', '/')
            if rel not in seen and f not in seen_filenames:
                manifest_files.append(rel)
                seen.add(rel)
                seen_filenames.add(f)

    content = [
        "CACHE MANIFEST",
        f"# PSFree AIO Unified Cache Manifest",
        f"# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "CACHE:"
    ]
    content.extend(manifest_files)
    content.extend(["", "NETWORK:", ""])

    for out_file in OUTPUT_FILES:
        manifest_path = os.path.join(root_dir, out_file)
        with open(manifest_path, "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(content))
        print(f"Successfully created {out_file} with {len(manifest_files)} entries.")

if __name__ == '__main__':
    create_manifest()
