# -*- coding: utf-8 -*-
"""Patch SEED_THUOC_98 DIEU_KIEN in du_lieu_luat_thuoc_muc8.jsx."""
import os
import re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
jsx = os.path.join(root, "ma_nguon", "tien_ich", "du_lieu_luat_thuoc_muc8.jsx")
die_path = os.path.join(root, "_dieukien_thuoc98_line.txt")
new_dieukien = open(die_path, encoding="utf-8").read().strip()

text = open(jsx, encoding="utf-8").read()
pattern = (
    r'(\{\s*"id"\s*:\s*"SEED_THUOC_98"[^}]*?"DIEU_KIEN"\s*:\s*")([^"]+)(")'
)
m = re.search(pattern, text, re.DOTALL)
if not m:
    raise SystemExit("SEED_THUOC_98 block not found")

# json string escape for value inside "
escaped = (
    new_dieukien.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
)

new_text = text[: m.start(2)] + escaped + text[m.end(2) :]
open(jsx, "w", encoding="utf-8").write(new_text)
print("Patched DIEU_KIEN length", len(new_dieukien))
