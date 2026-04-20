# -*- coding: utf-8 -*-
"""Cập nhật CANH_BAO cho quy tắc Kiểm tra Chỉ định ICD-10 sau khi đổi sang DM BV + ICD_DRUG."""
import re

PATH = r"c:\Users\admin\Documents\Google Drive\ung_dung_cdss_bhyt\ma_nguon\tien_ich\du_lieu_luat_thuoc_muc8.jsx"

BLOCK = re.compile(
    r'"TEN_QUY_TAC": "([^"]*Kiểm tra Chỉ định ICD-10[^"]*)",\s*\n'
    r'    "DIEU_KIEN": "((?:[^"\\]|\\.)*)",\s*\n'
    r'    "CANH_BAO": "((?:[^"\\]|\\.)*)"',
    re.MULTILINE,
)


def unescape_inner(s: str) -> str:
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


def escape_inner(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def label_from_ten(ten_quy_tac: str) -> str:
    m = re.match(r"^\[([^\]]+)\]", ten_quy_tac.strip())
    return m.group(1).strip() if m else ten_quy_tac.strip()


def decode_u_escape(s: str) -> str:
    """Chuỗi CANH_BAO cũ có thể chứa \\uXXXX (utf-8 file vẫn là 6 ký tự)."""

    def sub(m: re.Match) -> str:
        return chr(int(m.group(1), 16))

    return re.sub(r"\\u([0-9a-fA-F]{4})", sub, s)


def ref_from_old(old: str) -> str:
    s = decode_u_escape(old.strip())
    prefixes = (
        "⛔ [XUẤT TOÁN]: ",
        "⚠️ [KIỂM TRA]: ",
        "⚠️ [XUẤT TOÁN]: ",
    )
    for p in prefixes:
        if s.startswith(p):
            s = s[len(p) :].strip()
            break
    # Lặp lại nếu sau decode vẫn còn tiền tố (chuỗi lồng \\u…)
    for p in prefixes:
        if s.startswith(p):
            s = s[len(p) :].strip()
            break
    if s.endswith("."):
        s = s[:-1].strip()
    return s


def build_canhbao(ten_quy_tac: str, dieu_kien: str, old_canhbao: str) -> str:
    drug = label_from_ten(ten_quy_tac)
    ref = ref_from_old(old_canhbao)

    if "COUNT_IF(XML3" in dieu_kien and "LOAI_PTTT" in dieu_kien:
        return (
            f"⛔ [XUẤT TOÁN]: [{drug}] — Thuốc có trong danh mục nội bộ nhưng trên hồ sơ không có dòng XML3 "
            f"phẫu thuật/thủ thuật (LOAI_PTTT 1–4) đúng nhóm kỳ vọng khi kê thuốc theo phác đồ xuất toán. "
            f"Tham khảo chỉ định lâm sàng: {ref}."
        )

    has_rv = "CHAN_DOAN_RV" in dieu_kien
    has_vao = "CHAN_DOAN_VAO" in dieu_kien

    if not has_rv:
        return (
            f"⛔ [XUẤT TOÁN]: [{drug}] — Thuốc trong danh mục BV; có thẻ ICD_DRUG nhưng mã ICD chính/kèm không khớp "
            f"nhóm chỉ định đã khai báo trong Module Mapping. Tham khảo chỉ định (đối chiếu TT/BYT): {ref}."
        )

    if has_vao:
        mid = (
            "đồng thời CHẨN ĐOÁN RA và CHẨN ĐOÁN VÀO đều không chứa từ khóa ngoại lệ đã cấu hình trong quy tắc"
        )
    else:
        mid = "đồng thời CHẨN ĐOÁN RA không chứa từ khóa ngoại lệ đã cấu hình trong quy tắc"

    return (
        f"⛔ [XUẤT TOÁN]: [{drug}] — Thuốc trong danh mục BV; BV đã khai báo thẻ ICD_DRUG nhưng ICD/XML1 không khớp "
        f"chỉ định trong mapping; {mid}. Tham khảo chỉ định (đối chiếu TT/BYT): {ref}."
    )


def main() -> None:
    with open(PATH, encoding="utf-8") as f:
        text = f.read()

    n = 0

    def repl(m: re.Match) -> str:
        nonlocal n
        ten = m.group(1)
        dk_raw = m.group(2)
        cb_raw = m.group(3)
        dk = unescape_inner(dk_raw)
        old_cb = unescape_inner(cb_raw)
        new_cb = build_canhbao(ten, dk, old_cb)
        n += 1
        return (
            f'"TEN_QUY_TAC": "{ten}",\n'
            f'    "DIEU_KIEN": "{dk_raw}",\n'
            f'    "CANH_BAO": "{escape_inner(new_cb)}"'
        )

    new_text = BLOCK.sub(repl, text)

    new_text, _ = re.subn(
        r"export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '[^']*';",
        "export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '2026-04-19_muc8_canhbao_icd_drug_dm_bv';",
        new_text,
        count=1,
    )

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(new_text)

    print("Updated CANH_BAO blocks:", n)


if __name__ == "__main__":
    main()
