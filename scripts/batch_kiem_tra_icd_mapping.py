# -*- coding: utf-8 -*-
"""One-shot batch update: Kiểm tra Chỉ định ICD-10 -> DM BV + mapping ICD thuốc."""
import re

PATH = r"c:\Users\admin\Documents\Google Drive\ung_dung_cdss_bhyt\ma_nguon\tien_ich\du_lieu_luat_thuoc_muc8.jsx"

pat_kiem_tra = re.compile(
    r'("TEN_QUY_TAC": "[^"]*Kiểm tra Chỉ định ICD-10[^"]*",\s*\n\s*"DIEU_KIEN": ")((?:[^"\\]|\\.)*)("\s*,)',
)


def unescape_js_inner(s: str) -> str:
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            if s[i + 1] == '"':
                out.append('"')
                i += 2
                continue
            if s[i + 1] == "\\":
                out.append("\\")
                i += 2
                continue
        out.append(s[i])
        i += 1
    return "".join(out)


def escape_js_inner(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def transform_dk(dk_raw: str) -> str:
    dk = unescape_js_inner(dk_raw)

    if "CO_ICD_KHOP_MAPPING_THUOC" in dk and "CO_THUOC_TRONG_DM_BV" in dk:
        return dk_raw

    if "CO_ICD_KHOP_MAPPING_THUOC" in dk and "CO_THUOC_TRONG_DM_BV" not in dk:
        # Giữ nguyên chuỗi gốc (dk_raw): tránh escape_js_inner làm hỏng \\u trong REGEXP
        return re.sub(
            r"(XML2\.MA_THUOC == '[^']+' AND )",
            r"\1CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND ",
            dk_raw,
            count=1,
        )

    if "XML1.MA_BENH_CHINH NOT IN" not in dk:
        return dk_raw

    ma_m = re.search(r"XML2\.MA_THUOC == '([^']+)'", dk)
    if not ma_m:
        return dk_raw

    ma = ma_m.group(1)
    idx = dk.find("AND XML1.CHAN_DOAN")
    tail = dk[idx:].strip() if idx >= 0 else ""

    core = (
        f"XML2.MA_THUOC == '{ma}' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND "
        f"CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC)"
    )
    new_dk = core + (" " + tail if tail else "")
    return escape_js_inner(new_dk)


def main() -> None:
    with open(PATH, encoding="utf-8") as f:
        text = f.read()

    def repl(m: re.Match) -> str:
        return m.group(1) + transform_dk(m.group(2)) + m.group(3)

    new_text, n = pat_kiem_tra.subn(repl, text)

    new_text, _ = re.subn(
        r"export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '[^']*';",
        "export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '2026-04-19_muc8_kiem_tra_icd_mapping_dm_bv';",
        new_text,
        count=1,
    )

    new_text = new_text.replace(
        '"TEN_QUY_TAC": "[Rotundin Kiểm tra Chỉ định ICD-10"',
        '"TEN_QUY_TAC": "[Rotundin] Kiểm tra Chỉ định ICD-10"',
    )

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(new_text)

    print("Kiểm tra Chỉ định ICD-10 DIEU_KIEN blocks updated:", n)


if __name__ == "__main__":
    main()
