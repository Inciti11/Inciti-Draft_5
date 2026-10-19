#!/usr/bin/env python3
"""Empaqueta el plugin ALRÍO HTML Landing (HTML + css/js/assets en public/)."""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGIN_SRC = ROOT / "wordpress" / "plugin" / "alrio-html-page"
OUT = ROOT / "build" / "alrio-html-page"
PUBLIC = OUT / "public"
SOURCE = ROOT / "index.html"
CSS_FILES = (
    "css/base.css",
    "css/nav.css",
    "css/hero.css",
    "css/sections.css",
    "css/footer.css",
    "css/extras.css",
    "css/responsive.css",
    "css/ubicacion.css",
)


def rewrite_css_asset_urls(css: str) -> str:
    """CSS incrustado en la página: url(../assets/) debe ser URL absoluta del plugin."""
    css = re.sub(
        r'url\(\s*["\']?\.\./assets/',
        "url({{ALRIO_ASSET_BASE}}assets/",
        css,
    )
    css = re.sub(
        r'url\(\s*["\']\.\./assets/',
        "url({{ALRIO_ASSET_BASE}}assets/",
        css,
    )
    return css


def inline_styles() -> str:
    parts = []
    for rel in CSS_FILES:
        path = ROOT / rel
        if path.is_file():
            raw = path.read_text(encoding="utf-8")
            parts.append(f"/* {rel} */\n{rewrite_css_asset_urls(raw)}")
    return "\n".join(parts)


def build_landing_html() -> str:
    html = SOURCE.read_text(encoding="utf-8")
    html = re.sub(r'\s*<link rel="stylesheet" href="css/[^"]+">\s*', "\n", html)
    styles = inline_styles()
    block = f"<style>\n{styles}\n</style>\n"
    if "</head>" in html:
        html = html.replace("</head>", block + "</head>", 1)
    # Rutas relativas al plugin public/
    html = html.replace('href="assets/', 'href="{{ALRIO_ASSET_BASE}}assets/')
    html = html.replace('src="assets/', 'src="{{ALRIO_ASSET_BASE}}assets/')
    html = html.replace('src="js/', 'src="{{ALRIO_ASSET_BASE}}js/')
    return html


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    PUBLIC.mkdir(parents=True)
    shutil.copy2(PLUGIN_SRC / "alrio-html-page.php", OUT / "alrio-html-page.php")
    for dirname in ("css", "js", "assets"):
        src = ROOT / dirname
        if src.is_dir():
            shutil.copytree(src, PUBLIC / dirname)
    (PUBLIC / "landing.html").write_text(build_landing_html(), encoding="utf-8")
    zip_path = ROOT / "build" / "alrio-html-page.zip"
    if zip_path.exists():
        zip_path.unlink()
    shutil.make_archive(str(ROOT / "build" / "alrio-html-page"), "zip", OUT)
    print(f"Plugin listo: {OUT}")
    print(f"ZIP para WP: {zip_path}")


if __name__ == "__main__":
    build()
