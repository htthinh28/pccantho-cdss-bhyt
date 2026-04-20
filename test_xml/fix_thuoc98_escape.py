# -*- coding: utf-8 -*-
"""Sửa THUOC_98: DIEU_KIEN đúng escape (json.dumps 1 lần); cập nhật CANH_BAO/GHI_CHU."""
import json
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
jsx_path = os.path.join(root, "ma_nguon", "tien_ich", "du_lieu_luat_thuoc_muc8.jsx")

ch = open(os.path.join(root, "_thuoc98_chinh.txt"), encoding="utf-8").read().strip()
kt = open(os.path.join(root, "_thuoc98_kt.txt"), encoding="utf-8").read().strip()
dieukien = (
    "XML2.MA_THUOC == '40.28' AND NOT ((XML1.MA_BENH_CHINH REGEXP '"
    + ch
    + "') OR (XML1.MA_BENH_KT REGEXP '"
    + kt
    + "')) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|VIÊM KHỚP DẠNG THẤP|VIÊM CỘT SỐNG DÍNH|VIÊM CỘT SỐNG DÍ|ĐAU KHỚP|GÚT|GOUT|BỆNH GÚT)'"
)

canhbao = (
    "⛔ [XUẤT TOÁN]: Celecoxib (40.28 / Celosti 200) chỉ được thanh toán khi có chỉ định ICD-10 "
    "theo danh mục đã khai (M00–M19 khớp/viêm; M46.1; tiểu mã M01/M03/M07/M09/M14 theo STG; M05.3†) "
    "— hoặc CHAN_DOAN_RV gợi khớp/gút."
)
ghichu = (
    "2026-04-19: Danh mã ICD chỉ định Celecoxib mở rộng (~241 token; * = nhánh con; M05.3†). "
    "Giữ điều kiện CHAN_DOAN_RV."
)


def replace_json_string_field(text: str, block_start: int, block_end: int, key: str, new_val: str) -> str:
    sub = text[block_start:block_end]
    k = f'"{key}":'
    i = sub.index(k)
    key_end_rel = i + len(k)
    rest_full = sub[key_end_rel:]
    rest_strip = rest_full.lstrip()
    qpos = block_start + key_end_rel + (len(rest_full) - len(rest_strip))
    dec = json.JSONDecoder()
    _v, used = dec.raw_decode(text[qpos:])
    end_val = qpos + used
    return text[:qpos] + json.dumps(new_val) + text[end_val:]


text = open(jsx_path, encoding="utf-8").read()
anchor = text.index('"id": "SEED_THUOC_98"')
anchor99 = text.index('"id": "SEED_THUOC_99"', anchor)

text = replace_json_string_field(text, anchor, anchor99, "DIEU_KIEN", dieukien)
anchor = text.index('"id": "SEED_THUOC_98"')
anchor99 = text.index('"id": "SEED_THUOC_99"', anchor)
text = replace_json_string_field(text, anchor, anchor99, "CANH_BAO", canhbao)
anchor = text.index('"id": "SEED_THUOC_98"')
anchor99 = text.index('"id": "SEED_THUOC_99"', anchor)
text = replace_json_string_field(text, anchor, anchor99, "GHI_CHU", ghichu)

open(jsx_path, "w", encoding="utf-8").write(text)
print("Replaced DIEU_KIEN/CANH_BAO/GHI_CHU OK")
