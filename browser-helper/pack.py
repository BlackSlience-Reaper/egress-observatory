"""Build the offline ZIP and one store upload ZIP per browser from the same source and manifest version."""
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
# Chrome Web Store, Edge Add-ons and Opera add-ons take the Chrome package as is; other browsers apply a
# JSON merge patch (RFC 7396: null removes a key) to manifest.json.
TARGETS = {"chrome": None, "firefox": "manifest.firefox.json"}
# Listing name and the browsers each store serves, in the order the READMEs offer them.
STORES = (
    ("chrome", "Chrome 网上应用店", "Chrome、Brave、Vivaldi、Arc 等 Chromium 浏览器"),
    ("edge", "Microsoft Edge 加载项", "Edge"),
    ("firefox", "Firefox 附加组件", "Firefox 140 及以上桌面版"),
    ("opera", "Opera 加载项", "Opera"),
)
PENDING = {
    "opera": "待上架；也可借助 Opera 的“Install Chrome Extensions”扩展从 Chrome 网上应用店安装",
}


def merge(base, patch):
    if not isinstance(patch, dict):
        return patch
    merged = dict(base) if isinstance(base, dict) else {}
    for key, value in patch.items():
        if value is None:
            merged.pop(key, None)
        else:
            merged[key] = merge(merged.get(key), value)
    return merged


def store_urls():
    """Store URLs come from src/helper-stores.js, which the site reads too."""
    text = (ROOT / "src" / "helper-stores.js").read_text(encoding="utf-8")
    block = re.search(r"HELPER_STORES = \{(.*?)\};", text, re.S)
    if not block:
        raise ValueError("HELPER_STORES not found in src/helper-stores.js")
    urls = {key: url or None for key, url in re.findall(r"(\w+):\s*(?:null|'([^']*)')", block.group(1))}
    for key, url in urls.items():
        if url and not url.startswith("https://"):
            raise ValueError(f"Store URL for {key} must use https://")
    return urls


def store_lines(urls):
    lines = []
    for key, label, browsers in STORES:
        url = urls.get(key)
        lines.append(f"- [{label}]({url})：{browsers}" if url else f"- {label}：{browsers}，{PENDING.get(key, '待上架')}")
    return "\n".join(lines)


def update_references(version, stores):
    # The minimum version in src/render.js is raised by hand, only when the site needs a newer helper.
    for name in ("index.html", "README.md", "browser-helper/README.md"):
        path = ROOT / name
        original = path.read_text(encoding="utf-8")
        text = re.sub(rf"egress-browser-helper-v{VERSION}\.zip", f"egress-browser-helper-v{version}.zip", original)
        text = re.sub(rf"((?:Chrome |浏览器)(?:插件|扩展) v){VERSION}", rf"\g<1>{version}", text)
        text = re.sub(r"(<!-- helper-stores -->\n)(?:.*?\n)?(<!-- /helper-stores -->)", lambda m: f"{m.group(1)}{stores}\n{m.group(2)}", text, flags=re.S)
        if text != original:
            path.write_text(text, encoding="utf-8", newline="\n")
            print(f"Updated {name}")


def write_zip(path, files, prefix="", manifest=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(path, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(files):
            entry = ZipInfo(prefix + name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            data = manifest if name == "manifest.json" and manifest is not None else (HELPER / name).read_bytes()
            archive.writestr(entry, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"Built {path.relative_to(ROOT).as_posix()}")


def main():
    manifest = json.loads((HELPER / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    if not re.fullmatch(VERSION, version):
        raise ValueError("Invalid manifest version")
    files = set(RUNTIME_FILES) | set(manifest["icons"].values())
    update_references(version, store_lines(store_urls()))
    write_zip(ROOT / "downloads" / f"egress-browser-helper-v{version}.zip", files | {"README.md"}, "browser-helper/")
    for target, patch in TARGETS.items():
        built = None
        if patch:
            built = merge(manifest, json.loads((HELPER / patch).read_text(encoding="utf-8")))
            if built["version"] != version:
                raise ValueError(f"{patch} must not change the version")
            built = (json.dumps(built, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        write_zip(ROOT / "dist" / f"egress-browser-helper-v{version}-{target}.zip", files, manifest=built)


if __name__ == "__main__":
    main()
