"""Build offline and Chrome/Edge upload ZIPs from the manifest version."""
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

HELPER = Path(__file__).resolve().parent
ROOT = HELPER.parent
RUNTIME_FILES = (
    "background.js", "bridge.js", "manifest.json", "page-extract.js",
    "page-providers.js", "util.js",
)
VERSION = r"\d+(?:\.\d+){1,3}"


def update_references(version):
    # The minimum version in src/render.js is raised by hand, only when the site needs a newer helper.
    for name in ("index.html", "README.md", "browser-helper/README.md"):
        path = ROOT / name
        original = path.read_text(encoding="utf-8")
        text = re.sub(rf"egress-browser-helper-v{VERSION}\.zip", f"egress-browser-helper-v{version}.zip", original)
        text = re.sub(rf"(Chrome (?:插件|扩展) v){VERSION}", rf"\g<1>{version}", text)
        if text != original:
            path.write_text(text, encoding="utf-8", newline="\n")
            print(f"Updated {name}")


def write_zip(path, files, prefix=""):
    path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(path, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(files):
            entry = ZipInfo(prefix + name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, (HELPER / name).read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"Built {path.relative_to(ROOT).as_posix()}")


def main():
    manifest = json.loads((HELPER / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    if not re.fullmatch(VERSION, version):
        raise ValueError("Invalid manifest version")
    files = set(RUNTIME_FILES) | set(manifest["icons"].values())
    update_references(version)
    write_zip(ROOT / "downloads" / f"egress-browser-helper-v{version}.zip", files | {"README.md"}, "browser-helper/")
    write_zip(ROOT / "dist" / f"egress-browser-helper-v{version}-chrome.zip", files)


if __name__ == "__main__":
    main()
