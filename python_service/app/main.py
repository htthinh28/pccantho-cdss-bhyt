from collections import Counter
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
import re
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ai_unsloth_chat import sinh_tra_loi as ai_sinh_tra_loi
from .ai_unsloth_chat import trang_thai_ai as ai_trang_thai


class BatchAuditRequest(BaseModel):
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    options: Dict[str, Any] = Field(default_factory=dict)


class ChatMessage(BaseModel):
    role: str = "user"
    content: str = ""


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)
    max_new_tokens: int = Field(default=512, ge=1, le=2048)


PYTHON_SOURCE = "PYTHON_SERVICE"
SUPPORTED_RULES = ["NS_01", "NS_10", "CK_09", "CK_13", "CK_23", "CK_26", "CK_27", "CK_40", "CK_41", "CK_42", "CK_51", "CK_52", "CK_53", "CK_54", "CK_55", "CK_57", "CK_58"]
REPO_ROOT = Path(__file__).resolve().parents[2]
ICD_CHRONIC_FILE = REPO_ROOT / "ma_nguon" / "thanh_phan" / "icd10_ke_don_tren_30_ngay.jsx"
ICD_CODE_PATTERN = re.compile(r"[A-Z][0-9]{2}(?:\.[0-9A-Z]+)?")
ICD_RANGE_PATTERN = re.compile(r"^([A-Z])(\d{2})(?:\.[0-9A-Z]+)?\s*(?:ĐẾN|DEN|TO|-)\s*([A-Z])(\d{2})(?:\.[0-9A-Z]+)?$", re.IGNORECASE)
DM_KHAM = {
    "01.0001.0001",
    "01.0002.0001",
    "01.0003.0001",
    "01.0004.0001",
    "01.0005.0001",
    "01.0006.0001",
    "01.0007.0001",
    "01.0008.0001",
    "01.0009.0001",
    "01.0010.0001",
}


def lay_ma_lk(claim: Dict[str, Any]) -> str:
    xml1 = claim.get("xml1") or claim.get("XML1") or {}
    return str(
        claim.get("ma_lk")
        or xml1.get("MA_LK")
        or ""
    ).strip()


def lay_xml1(claim: Dict[str, Any]) -> Dict[str, Any]:
    value = claim.get("xml1") or claim.get("XML1") or {}
    return value if isinstance(value, dict) else {}


def lay_xml3(claim: Dict[str, Any]) -> List[Dict[str, Any]]:
    value = claim.get("xml3") or claim.get("XML3") or []
    return value if isinstance(value, list) else []


def normalize_text(value: Any) -> str:
    return str(value or "").strip().upper()


def normalize_ma_loai_kcb(value: Any) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    digits = "".join(ch for ch in raw if ch.isdigit())
    return digits.zfill(2) if digits else raw


def normalize_icd_prefix(value: Any) -> str:
    token = normalize_text(value).replace(" ", "")
    match = ICD_CODE_PATTERN.search(token)
    if not match:
        return ""
    return match.group(0).split(".")[0]


def normalize_day_key(value: Any) -> str:
    raw = "".join(ch for ch in str(value or "") if ch.isdigit())
    return raw[:8]


def normalize_month_key(value: Any) -> str:
    raw = "".join(ch for ch in str(value or "") if ch.isdigit())
    return raw[:6]


def normalize_time_key(value: Any) -> str:
    raw = "".join(ch for ch in str(value or "") if ch.isdigit())
    return raw[:12]


def la_xml3_loai_tru_ns10_xet_nghiem(row: Dict[str, Any]) -> bool:
    """NS_10: loại trừ DVKT nhóm xét nghiệm (MA_NHOM=2 theo QĐ 130) + heuristic tên dịch vụ."""
    if not isinstance(row, dict):
        return False
    nhom = "".join(ch for ch in str(row.get("MA_NHOM") or "") if not ch.isspace())
    nhom = nhom.lstrip("0") or nhom
    if nhom == "2":
        return True
    ten = str(row.get("TEN_DICH_VU") or row.get("TEN_DVKT") or "")
    if re.search(r"xét\s*nghiệm", ten, re.IGNORECASE):
        return True
    ten_u = normalize_text(ten)
    return "XET NGHIEM" in ten_u or "XÉT NGHIỆM" in ten_u


def day_diff(from_day: str, to_day: str) -> int:
    try:
        start = datetime.strptime(from_day[:8], "%Y%m%d")
        end = datetime.strptime(to_day[:8], "%Y%m%d")
        return (end - start).days
    except (TypeError, ValueError):
        return 999999


def parse_datetime_value(value: Any) -> datetime | None:
    raw = "".join(ch for ch in str(value or "") if ch.isdigit())
    if len(raw) >= 12:
        try:
            return datetime.strptime(raw[:12], "%Y%m%d%H%M")
        except ValueError:
            return None
    if len(raw) >= 8:
        try:
            return datetime.strptime(raw[:8], "%Y%m%d")
        except ValueError:
            return None
    return None


def diff_minutes(from_value: Any, to_value: Any) -> int:
    start = parse_datetime_value(from_value)
    end = parse_datetime_value(to_value)
    if start and end:
        return int((end - start).total_seconds() // 60)
    from_day = normalize_day_key(from_value)
    to_day = normalize_day_key(to_value)
    if from_day and to_day:
        return day_diff(from_day, to_day) * 1440
    return 0


def to_number(value: Any) -> float:
    try:
        text = str(value or "").strip().replace(",", "")
        return float(text) if text else 0.0
    except (TypeError, ValueError):
        return 0.0


def lay_ma_dich_vu(row: Dict[str, Any]) -> str:
    return normalize_text((row or {}).get("MA_DV") or (row or {}).get("MA_DICH_VU") or (row or {}).get("MA_DVKT"))


DM_KHAM_NORMALIZED = {item.upper() for item in DM_KHAM}


def tao_tap_dm_kham_tu_options(options: Dict[str, Any] | None) -> set:
    raw_values = options.get("dm_kham") if isinstance(options, dict) else []
    return {normalize_text(item) for item in raw_values if normalize_text(item)}


def tao_tap_ma_khoa_kham_tu_options(options: Dict[str, Any] | None) -> set:
    raw_values = options.get("ma_khoa_kham") if isinstance(options, dict) else []
    return {normalize_text(item) for item in raw_values if normalize_text(item)}


def is_kham_service(row: Dict[str, Any], dm_kham_runtime: set | None = None) -> bool:
    ma_dv = lay_ma_dich_vu(row)
    if not ma_dv:
        return False
    tap_dm_kham = dm_kham_runtime if dm_kham_runtime else DM_KHAM_NORMALIZED
    if ma_dv in tap_dm_kham:
        return True
    if ma_dv.startswith("01."):
        return True
    if "KHAM" in ma_dv:
        return True
    return False


def la_khoa_kham_benh(ma_khoa: Any) -> bool:
    khoa = normalize_text(ma_khoa).replace(" ", "").replace("-", "_")
    return khoa in {"KHOA_KHAM_BENH", "KHOAKHAMBENH", "KHOA_KHAMBENH"}


def la_ho_so_ngoai_tru_theo_qd824(xml1: Dict[str, Any] | None = None) -> bool:
    return normalize_ma_loai_kcb((xml1 or {}).get("MA_LOAI_KCB")) in {"01", "02", "05", "06", "07", "08"}


def la_ho_so_noi_tru_theo_qd824(xml1: Dict[str, Any] | None = None) -> bool:
    ma_loai = normalize_ma_loai_kcb((xml1 or {}).get("MA_LOAI_KCB"))
    return ma_loai in {"03", "09"} or (not ma_loai and normalize_day_key((xml1 or {}).get("NGAY_VAO_NOI_TRU")))


def la_ho_so_noi_tru_ban_ngay_theo_qd824(xml1: Dict[str, Any] | None = None) -> bool:
    return normalize_ma_loai_kcb((xml1 or {}).get("MA_LOAI_KCB")) == "04"


def tach_ma_benh_tu_text(value: Any) -> List[str]:
    raw = normalize_text(value).replace("ĐẾN", "-")
    return [match.group(0).split(".")[0] for match in ICD_CODE_PATTERN.finditer(raw)]


def expand_icd_expression(expression: str) -> List[str]:
    normalized = normalize_text(expression).replace(",", " ")
    if not normalized:
        return []
    range_match = ICD_RANGE_PATTERN.match(normalized)
    if range_match and range_match.group(1) == range_match.group(3):
        prefix = range_match.group(1)
        start = int(range_match.group(2))
        end = int(range_match.group(4))
        if start <= end:
            return [f"{prefix}{index:02d}" for index in range(start, end + 1)]
    return tach_ma_benh_tu_text(normalized)


@lru_cache(maxsize=1)
def tai_tap_icd_man_tinh() -> set:
    if not ICD_CHRONIC_FILE.exists():
        return set()
    try:
        content = ICD_CHRONIC_FILE.read_text(encoding="utf-8")
    except OSError:
        return set()

    matches = re.findall(r'"Mã bệnh theo ICD 10"\s*:\s*"([^"]+)"', content)
    prefixes = set()
    for item in matches:
      for prefix in expand_icd_expression(item):
          if prefix:
              prefixes.add(prefix)
    return prefixes


def has_chronic_diagnosis(entry: Dict[str, Any]) -> bool:
    tap_icd = tai_tap_icd_man_tinh()
    if not tap_icd:
        return False
    xml1 = entry.get("xml1") or {}
    diagnosis_values = [
        xml1.get("MA_BENH"),
        xml1.get("MA_BENH_CHINH"),
        xml1.get("MA_BENH_KT"),
    ]
    ma_benh = []
    for value in diagnosis_values:
        ma_benh.extend(tach_ma_benh_tu_text(value))
    return any(code in tap_icd for code in ma_benh)


def tao_canh_bao(
    ma_luat: str,
    ten_quy_tac: str,
    canh_bao: str,
    noi_dung: str,
    phan_he: str = "XML1",
    truong_loi: str = "UNKNOWN",
    index: int = -1,
    dieu_kien: str = "",
) -> Dict[str, Any]:
    ma = str(ma_luat or "").strip().upper()
    namespace_quy_tac = ""
    nguon_quy_tac = "python_service"
    luong_giai_trinh = ""
    tab_quan_tri_goi_y = ""

    if ma.startswith("HC-") or ma.startswith("HC_"):
        namespace_quy_tac = "HANH_CHINH_BATCH_PYTHON"
        luong_giai_trinh = "Python batch audit -> hành chính"
        tab_quan_tri_goi_y = "LUAT_HANH_CHINH"
    elif ma.startswith("THUOC_"):
        namespace_quy_tac = "THUOC_BATCH_PYTHON"
        luong_giai_trinh = "Python batch audit -> thuốc"
        tab_quan_tri_goi_y = "LUAT_THUOC"
    elif ma.startswith("NS_"):
        namespace_quy_tac = "NHAN_SU_BATCH_PYTHON"
        luong_giai_trinh = "Python batch audit -> nhân sự"
        tab_quan_tri_goi_y = "LUAT_NHAN_SU"
    elif ma.startswith("CK_"):
        namespace_quy_tac = "CONG_KHAM_BATCH_PYTHON"
        luong_giai_trinh = "Python batch audit -> công khám"
        tab_quan_tri_goi_y = "LUAT_CONG_KHAM"
    elif ma.startswith("PY_BATCH_"):
        namespace_quy_tac = "PYTHON_BATCH_META"
        luong_giai_trinh = "Python batch audit -> kiểm tra đợt nhập"

    return {
        "phan_he": phan_he,
        "index": index,
        "truong_loi": truong_loi,
        "canh_bao": canh_bao,
        "muc_do": "warning",
        "ma_luat": ma_luat,
        "ten_quy_tac": ten_quy_tac,
        "dieu_kien": dieu_kien,
        "co_so_phap_ly": "",
        "noi_dung": noi_dung,
        "namespace_quy_tac": namespace_quy_tac,
        "nguon_quy_tac": nguon_quy_tac,
        "luong_giai_trinh": luong_giai_trinh,
        "tab_quan_tri_goi_y": tab_quan_tri_goi_y,
        "nguon_giam_dinh": PYTHON_SOURCE,
    }


def tao_khoa_canh_bao(canh_bao: Dict[str, Any]) -> str:
    return "|".join(
        [
            str(canh_bao.get("ma_luat") or ""),
            str(canh_bao.get("phan_he") or ""),
            str(canh_bao.get("truong_loi") or ""),
            str(canh_bao.get("index") if canh_bao.get("index") is not None else -1),
            str(canh_bao.get("canh_bao") or ""),
        ]
    )


def them_canh_bao_khong_trung(danh_sach: List[Dict[str, Any]], canh_bao: Dict[str, Any]) -> None:
    khoa = tao_khoa_canh_bao(canh_bao)
    if any(tao_khoa_canh_bao(item) == khoa for item in danh_sach):
        return
    danh_sach.append(canh_bao)


def tao_entry_claim(claim: Dict[str, Any], index: int) -> Dict[str, Any]:
    xml1 = lay_xml1(claim)
    xml3 = lay_xml3(claim)
    return {
        "index": index,
        "claim": claim,
        "xml1": xml1,
        "xml3": xml3,
        "ma_lk": lay_ma_lk(claim),
        "ma_bn": normalize_text(xml1.get("MA_BN")),
        "ma_cskcb": normalize_text(xml1.get("MA_CSKCB")),
        "nam_vao": normalize_day_key(xml1.get("NGAY_VAO") or xml1.get("TU_NGAY"))[:4],
        "ngay_vao": normalize_day_key(xml1.get("NGAY_VAO") or xml1.get("TU_NGAY")),
        "thang_vao": normalize_month_key(xml1.get("NGAY_VAO") or xml1.get("TU_NGAY")),
        "ma_ly_do_vv": normalize_text(xml1.get("MA_LY_DO_VV")),
    }


def tao_moc_thoi_gian_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_python_claim_results(claims: List[Dict[str, Any]], options: Dict[str, Any] | None = None) -> Dict[str, Any]:
    entries = [tao_entry_claim(claim, index) for index, claim in enumerate(claims)]
    dm_kham_runtime = tao_tap_dm_kham_tu_options(options)
    ma_khoa_kham_runtime = tao_tap_ma_khoa_kham_tu_options(options)
    ma_lk_counter = Counter(entry["ma_lk"] for entry in entries if entry["ma_lk"])
    patient_day_counter = Counter(
        (entry["ma_bn"], entry["ngay_vao"])
        for entry in entries
        if entry["ma_bn"] and entry["ngay_vao"]
    )
    patient_day_entries: Dict[Any, List[Dict[str, Any]]] = {}
    patient_entries_sorted: Dict[str, List[Dict[str, Any]]] = {}
    doctor_time_counter = Counter()
    doctor_time_rows: Dict[Any, List[Dict[str, Any]]] = {}
    duplicate_lk_same_facility_month_counter = Counter(
        (entry["ma_lk"], entry["ma_cskcb"], entry["thang_vao"])
        for entry in entries
        if entry["ma_lk"] and entry["ma_cskcb"] and entry["thang_vao"]
    )
    doctor_day_facilities: Dict[Any, set] = {}

    for entry in entries:
        if entry["ma_bn"] and entry["ngay_vao"]:
            patient_day_entries.setdefault((entry["ma_bn"], entry["ngay_vao"]), []).append(entry)
            patient_entries_sorted.setdefault(entry["ma_bn"], []).append(entry)
        for row_index, row in enumerate(entry["xml3"]):
            if not isinstance(row, dict):
                continue
            doctor_key = normalize_text(row.get("NGUOI_THUC_HIEN") or row.get("MA_BAC_SI") or row.get("MA_BS"))
            time_key = normalize_time_key(row.get("NGAY_YL") or row.get("NGAY_KQ") or row.get("NGAY_TH_YL"))
            day_key = normalize_day_key(row.get("NGAY_YL") or row.get("NGAY_KQ") or row.get("NGAY_TH_YL")) or entry["ngay_vao"]
            if not doctor_key or not time_key:
                if doctor_key and day_key and entry["ma_cskcb"]:
                    doctor_day_facilities.setdefault((doctor_key, day_key), set()).add(entry["ma_cskcb"])
                continue
            doctor_time_counter[(doctor_key, time_key)] += 1
            doctor_time_rows.setdefault((doctor_key, time_key), []).append({
                "entry": entry,
                "row": row,
                "row_index": row_index,
            })
            if day_key and entry["ma_cskcb"]:
                doctor_day_facilities.setdefault((doctor_key, day_key), set()).add(entry["ma_cskcb"])

    for danh_sach in patient_entries_sorted.values():
        danh_sach.sort(key=lambda item: ((item.get("ngay_vao") or ""), item.get("index") or 0))

    results: List[Dict[str, Any]] = []
    duplicates = [
        {"ma_lk": ma_lk, "count": count}
        for ma_lk, count in ma_lk_counter.items()
        if count > 1
    ]

    for entry in entries:
        claim = dict(entry["claim"])
        existing_results = claim.get("ket_qua_giam_dinh")
        ket_qua_giam_dinh = list(existing_results) if isinstance(existing_results, list) else []
        is_chronic = has_chronic_diagnosis(entry)
        kham_rows = [
            {"row_index": row_index, "row": row}
            for row_index, row in enumerate(entry["xml3"])
            if isinstance(row, dict) and is_kham_service(row, dm_kham_runtime)
        ]
        kham_rows_co_ban = [
            item for item in kham_rows if normalize_text(item["row"].get("MA_BAN_KHAM"))
        ]
        same_patient_entries = patient_entries_sorted.get(entry["ma_bn"], []) if entry["ma_bn"] else []
        same_year_entries = [item for item in same_patient_entries if item.get("nam_vao") and item.get("nam_vao") == entry.get("nam_vao")]
        previous_visit = None
        if same_patient_entries:
            current_pos = next((idx for idx, item in enumerate(same_patient_entries) if item.get("index") == entry.get("index")), -1)
            if current_pos > 0:
                previous_visit = same_patient_entries[current_pos - 1]

        if la_ho_so_noi_tru_ban_ngay_theo_qd824(entry["xml1"]) and len(kham_rows) > 1:
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="CK_09",
                    ten_quy_tac="Điều trị nội trú ban ngày (mã 04) và Công khám",
                    canh_bao="⚠️ [KIỂM TRA]: Người bệnh thuộc loại hình điều trị nội trú ban ngày (mã 04 theo QĐ 824). Chỉ được tính 01 công khám khi bắt đầu đợt điều trị.",
                    noi_dung=(
                        f"Hồ sơ {entry['ma_lk'] or 'N/A'} thuộc loại nội trú ban ngày nhưng có {len(kham_rows)} dòng công khám."
                    ),
                    phan_he="XML3",
                    truong_loi="MA_DV",
                    index=kham_rows[1]["row_index"],
                    dieu_kien="XML1.MA_LOAI_KCB == '2' AND COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM)) > 1",
                ),
            )

        if len(kham_rows) >= 2:
            row_vi_pham_ck41 = next(
                (
                    item for item in kham_rows
                    if to_number(item["row"].get("STT")) >= 2
                    and to_number(item["row"].get("THANH_TIEN")) > (to_number(item["row"].get("DON_GIA")) * 0.3)
                ),
                None,
            )
            if row_vi_pham_ck41:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_41",
                        ten_quy_tac="Tỷ lệ thanh toán lần khám thứ 2+",
                        canh_bao="⛔ [SAI ĐƠN GIÁ]: Từ lần khám thứ 02 trở đi chỉ được tính 30% mức giá của 01 lần khám bệnh. Vui lòng kiểm tra lại trường XML3.THANH_TIEN.",
                        noi_dung=(
                            f"Hồ sơ {entry['ma_lk'] or 'N/A'} có ít nhất 02 dòng công khám, nhưng dòng STT "
                            f"{int(to_number(row_vi_pham_ck41['row'].get('STT')))} vẫn thanh toán vượt ngưỡng 30%."
                        ),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=row_vi_pham_ck41["row_index"],
                        dieu_kien="COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM)) >= 2 AND COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM) AND TO_NUMBER(item.STT) >= 2 AND TO_NUMBER(item.THANH_TIEN) > (TO_NUMBER(item.DON_GIA) * 0.3)) > 0",
                    ),
                )

            tong_tien_kham_ho_so = sum(to_number(item["row"].get("THANH_TIEN")) for item in kham_rows)
            don_gia_kham_cao_nhat = max((to_number(item["row"].get("DON_GIA")) for item in kham_rows), default=0.0)
            if don_gia_kham_cao_nhat > 0 and tong_tien_kham_ho_so > (don_gia_kham_cao_nhat * 2):
                row_moc_ck53 = max(
                    kham_rows,
                    key=lambda item: to_number(item["row"].get("DON_GIA")),
                )
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_53",
                        ten_quy_tac="Trần thanh toán 200% công khám",
                        canh_bao="⛔ [VƯỢT ĐỊNH MỨC]: Mức thanh toán tối đa chi phí khám bệnh trong một lần đến khám không được quá 02 lần mức giá của 01 lần khám bệnh cao nhất.",
                        noi_dung=(
                            f"Tổng tiền công khám của hồ sơ là {int(tong_tien_kham_ho_so):,} đồng, vượt trần 200% "
                            f"so với mức giá khám cao nhất {int(don_gia_kham_cao_nhat):,} đồng."
                        ).replace(",", "."),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=row_moc_ck53["row_index"],
                        dieu_kien="COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM)) > 0 AND ALL(XML3, item => !(item.MA_DV IN (DM_KHAM)) OR SUM_IF(XML3, row => row.MA_DV IN (DM_KHAM), row => TO_NUMBER(row.THANH_TIEN)) > (TO_NUMBER(item.DON_GIA) * 2))",
                    ),
                )

        if len(kham_rows_co_ban) > 65:
            row_vi_pham_ck54 = next(
                (
                    item for item in kham_rows_co_ban
                    if to_number(item["row"].get("STT")) >= 66
                    and to_number(item["row"].get("THANH_TIEN")) > (to_number(item["row"].get("DON_GIA")) * 0.5)
                ),
                None,
            )
            if row_vi_pham_ck54:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_54",
                        ten_quy_tac="Vượt định mức 65 lượt/bàn/8h",
                        canh_bao="⛔ [VƯỢT TỶ TRỌNG]: Bàn khám vượt 65 lượt/08 giờ. Từ lượt thứ 66 trở đi cơ quan BHXH chỉ thanh toán 50% mức giá khám bệnh.",
                        noi_dung=(
                            f"Hồ sơ có {len(kham_rows_co_ban)} dòng công khám gắn MA_BAN_KHAM; dòng STT "
                            f"{int(to_number(row_vi_pham_ck54['row'].get('STT')))} vẫn thanh toán vượt ngưỡng 50%."
                        ),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=row_vi_pham_ck54["row_index"],
                        dieu_kien="COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM) AND !IS_EMPTY(item.MA_BAN_KHAM)) > 65 AND COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM) AND TO_NUMBER(item.STT) >= 66 AND TO_NUMBER(item.THANH_TIEN) > (TO_NUMBER(item.DON_GIA) * 0.5)) > 0",
                    ),
                )

        ma_khoa_vao = normalize_text(entry["xml1"].get("MA_KHOA_VAO"))
        if (
            la_ho_so_noi_tru_theo_qd824(entry["xml1"])
            and kham_rows
            and entry["ma_ly_do_vv"] != "1"
            and ma_khoa_vao
            and ma_khoa_kham_runtime
            and ma_khoa_vao not in ma_khoa_kham_runtime
        ):
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="CK_55",
                    ten_quy_tac="Điều trị nội trú (mã 03/09) không qua khoa khám",
                    canh_bao="⛔ [XUẤT TOÁN]: Người bệnh vào điều trị nội trú theo QĐ 824 (mã 03 hoặc 09) trực tiếp tại khoa lâm sàng, không đăng ký khám tại khoa khám bệnh thì không được thanh toán tiền khám.",
                    noi_dung=(
                        f"Hồ sơ {entry['ma_lk'] or 'N/A'} vào khoa {ma_khoa_vao} nhưng không thuộc tập khoa khám runtime gửi sang Python."
                    ),
                    phan_he="XML1",
                    truong_loi="MA_KHOA_VAO",
                    dieu_kien="XML1.MA_LOAI_KCB == '3' AND COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM)) > 0 AND XML1.MA_KHOA_VAO != (MA_KHOA_KHAM) AND XML1.MA_LY_DO_VV != '1'",
                ),
            )

        if la_ho_so_ngoai_tru_theo_qd824(entry["xml1"]) and diff_minutes(entry["xml1"].get("NGAY_VAO"), entry["xml1"].get("NGAY_RA")) > 1440:
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="CK_42",
                    ten_quy_tac="Công khám buồng lưu nhóm khám/điều trị ngoại trú quá 24h",
                    canh_bao="⛔ [SAI LOẠI HÌNH]: Nhóm khám bệnh/điều trị ngoại trú theo QĐ 824 lưu theo dõi quá 24h (1440 phút). Phải chuyển sang điều trị nội trú (mã 03/09) hoặc điều trị nội trú ban ngày (mã 04).",
                    noi_dung=(
                        f"Hồ sơ {entry['ma_lk'] or 'N/A'} thuộc nhóm khám/điều trị ngoại trú nhưng thời gian vào-ra vượt 24 giờ."
                    ),
                    truong_loi="NGAY_RA",
                    dieu_kien="XML1.MA_LOAI_KCB == '1' AND DIFF_MINUTES(XML1.NGAY_VAO, XML1.NGAY_RA) > 1440",
                ),
            )

        ngay_ra = normalize_day_key(entry["xml1"].get("NGAY_RA"))
        if la_ho_so_noi_tru_theo_qd824(entry["xml1"]) and ngay_ra:
            row_vi_pham_ck57 = next(
                (
                    item for item in kham_rows
                    if normalize_day_key(item["row"].get("NGAY_YL") or item["row"].get("NGAY_KQ") or item["row"].get("NGAY_TH_YL")) == ngay_ra
                ),
                None,
            )
            if row_vi_pham_ck57:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_57",
                        ten_quy_tac="Khám bệnh trong ngày ra viện nội trú",
                        canh_bao="⛔ [XUẤT TOÁN]: Không tính công khám nhóm khám bệnh/điều trị ngoại trú trong ngày người bệnh làm thủ tục ra viện từ đợt điều trị nội trú (mã 03/09) tại cùng một cơ sở.",
                        noi_dung=(
                            f"Hồ sơ nội trú {entry['ma_lk'] or 'N/A'} có công khám phát sinh trùng ngày ra viện {ngay_ra}."
                        ),
                        phan_he="XML3",
                        truong_loi="NGAY_YL",
                        index=row_vi_pham_ck57["row_index"],
                        dieu_kien="XML1.MA_LOAI_KCB == '3' AND COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM) AND SUBSTR(item.NGAY_YL, 1, 8) == SUBSTR(XML1.NGAY_RA, 1, 8)) > 0",
                    ),
                )

        khoa_to_dich_vu: Dict[str, set] = {}
        khoa_to_row_index: Dict[str, int] = {}
        for item in kham_rows:
            row = item["row"]
            ma_khoa = normalize_text(row.get("MA_KHOA"))
            ma_dv = lay_ma_dich_vu(row)
            if not ma_khoa or not ma_dv or la_khoa_kham_benh(ma_khoa):
                continue
            khoa_to_dich_vu.setdefault(ma_khoa, set()).add(ma_dv)
            khoa_to_row_index.setdefault(ma_khoa, item["row_index"])

        khoa_vi_pham_ck58 = next((ma_khoa for ma_khoa, dich_vu in khoa_to_dich_vu.items() if len(dich_vu) > 1), "")
        if khoa_vi_pham_ck58:
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="CK_58",
                    ten_quy_tac="Khám nhiều chuyên khoa cùng Khoa",
                    canh_bao="⛔ [XUẤT TOÁN]: Trong cùng một khoa lâm sàng chỉ được tính 01 lần khám bệnh (trừ khoa Khám bệnh đa khoa).",
                    noi_dung=(
                        f"Khoa {khoa_vi_pham_ck58} có {len(khoa_to_dich_vu[khoa_vi_pham_ck58])} mã công khám khác nhau trong cùng hồ sơ."
                    ),
                    phan_he="XML3",
                    truong_loi="MA_KHOA",
                    index=khoa_to_row_index.get(khoa_vi_pham_ck58, -1),
                    dieu_kien="COUNT_DISTINCT(XML3, item => (item.MA_DV IN (DM_KHAM) AND !IS_EMPTY(item.MA_KHOA) AND item.MA_KHOA != 'KHOA_KHAM_BENH') ? (item.MA_KHOA + '|' + item.MA_DV) : '') > COUNT_DISTINCT(XML3, item => (item.MA_DV IN (DM_KHAM) AND !IS_EMPTY(item.MA_KHOA) AND item.MA_KHOA != 'KHOA_KHAM_BENH') ? item.MA_KHOA : '')",
                ),
            )

        if entry["ma_lk"] and ma_lk_counter.get(entry["ma_lk"], 0) > 1:
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="PY_BATCH_001",
                    ten_quy_tac="Trùng MA_LK trong batch",
                    canh_bao="⚠️ [PY BATCH]: MA_LK xuất hiện nhiều lần trong cùng đợt nhập.",
                    noi_dung=f"MA_LK {entry['ma_lk']} xuất hiện {ma_lk_counter[entry['ma_lk']]} lần trong batch.",
                    truong_loi="MA_LK",
                    dieu_kien="DUPLICATE(MA_LK) IN CURRENT_BATCH",
                ),
            )

        duplicate_ns01_key = (entry["ma_lk"], entry["ma_cskcb"], entry["thang_vao"])
        if (
            entry["ma_lk"]
            and entry["ma_cskcb"]
            and entry["thang_vao"]
            and duplicate_lk_same_facility_month_counter.get(duplicate_ns01_key, 0) > 1
        ):
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="NS_01",
                    ten_quy_tac="Kiểm tra trùng mã liên kết (MA_LK)",
                    canh_bao="⛔ [LỖI DỮ LIỆU]: Mã liên kết (MA_LK) bị trùng lặp trong cùng kỳ. Cổng kiểm tra BHXH sẽ từ chối tiếp nhận hồ sơ.",
                    noi_dung=(
                        f"MA_LK {entry['ma_lk']} bị trùng trong cùng cơ sở {entry['ma_cskcb']} "
                        f"và cùng tháng {entry['thang_vao']}."
                    ),
                    truong_loi="MA_LK",
                    dieu_kien="DUPLICATE(XML1.MA_LK) WITHIN SAME XML1.MA_CSKCB AND SAME MONTH",
                ),
            )

        patient_day_key = (entry["ma_bn"], entry["ngay_vao"])
        if entry["ma_bn"] and entry["ngay_vao"] and patient_day_counter.get(patient_day_key, 0) > 1:
            them_canh_bao_khong_trung(
                ket_qua_giam_dinh,
                tao_canh_bao(
                    ma_luat="PY_BATCH_002",
                    ten_quy_tac="Bệnh nhân có nhiều hồ sơ cùng ngày",
                    canh_bao="⚠️ [PY BATCH]: Bệnh nhân xuất hiện nhiều hồ sơ trong cùng ngày tiếp nhận.",
                    noi_dung=(
                        f"Mã bệnh nhân {entry['ma_bn']} có {patient_day_counter[patient_day_key]} hồ sơ "
                        f"trong ngày {entry['ngay_vao']}."
                    ),
                    truong_loi="NGAY_VAO",
                    dieu_kien="COUNT(MA_BN, NGAY_VAO) > 1 IN CURRENT_BATCH",
                ),
            )

        if entry["ma_bn"] and entry.get("nam_vao"):
            tong_tien_kham_nam = sum(
                to_number(row.get("THANH_TIEN"))
                for item in same_year_entries
                for row in item.get("xml3", [])
                if isinstance(row, dict) and is_kham_service(row, dm_kham_runtime)
            )
            if tong_tien_kham_nam > 2000000:
                first_kham_index = next(
                    (row_index for row_index, row in enumerate(entry["xml3"]) if isinstance(row, dict) and is_kham_service(row, dm_kham_runtime)),
                    -1,
                )
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_23",
                        ten_quy_tac="Công khám vượt định mức 2.000.000đ/năm",
                        canh_bao="⚠️ [RỦI RO]: Bệnh nhân có tổng tiền công khám trong năm quá cao. BHXH sẽ kiểm tra trục lợi thẻ BHYT.",
                        noi_dung=(
                            f"Bệnh nhân {entry['ma_bn']} có tổng tiền công khám năm {entry['nam_vao']} là "
                            f"{int(tong_tien_kham_nam):,} đồng trong batch hiện tại."
                        ).replace(",", "."),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=first_kham_index,
                        dieu_kien="SUM_IF(XML3, item => item.MA_DV IN (DM_KHAM), item => TO_NUMBER(item.THANH_TIEN)) > 2000000",
                    ),
                )

        if is_chronic and entry["ma_bn"] and entry.get("nam_vao"):
            chronic_visits_in_year = [item for item in same_year_entries if has_chronic_diagnosis(item)]
            if len(chronic_visits_in_year) > 12:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_26",
                        ten_quy_tac="Khám bệnh mạn tính quá 12 lần/năm",
                        canh_bao="⚠️ [TẦN SUẤT]: Bệnh nhân mạn tính khám quá 12 lần/năm. Kiểm tra sự cần thiết của các lần khám phát sinh.",
                        noi_dung=(
                            f"Bệnh nhân {entry['ma_bn']} có {len(chronic_visits_in_year)} lượt khám bệnh mạn tính trong năm {entry['nam_vao']} "
                            f"ở batch hiện tại."
                        ),
                        truong_loi="MA_BENH",
                        dieu_kien="COUNT_VISIT(XML1.MA_BN WHERE XML1.MA_BENH IN (DM_BENH_MAN_TINH) AND SUBSTR(XML1.NGAY_VAO, 1, 4) == SUBSTR(NOW, 1, 4)) > 12",
                    ),
                )

        if is_chronic and previous_visit and previous_visit.get("ngay_vao") and entry.get("ngay_vao"):
            khoang_cach_ngay = day_diff(previous_visit["ngay_vao"], entry["ngay_vao"])
            if khoang_cach_ngay < 15:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_27",
                        ten_quy_tac="Công khám bệnh án mạn tính",
                        canh_bao="⚠️ [TẦN SUẤT]: Bệnh nhân mạn tính tái khám dưới 15 ngày. Kiểm tra lý do khám sớm để tránh bị xuất toán tần suất.",
                        noi_dung=(
                            f"Bệnh nhân {entry['ma_bn']} tái khám sau {khoang_cach_ngay} ngày kể từ lượt trước "
                            f"{previous_visit['ngay_vao']} -> {entry['ngay_vao']}."
                        ),
                        truong_loi="NGAY_VAO",
                        dieu_kien="XML1.MA_BENH IN (DM_BENH_MAN_TINH) AND DATEDIFF_DAY(SUBSTR(LAST_VISIT.NGAY_VAO, 1, 8), SUBSTR(XML1.NGAY_VAO, 1, 8)) < 15",
                    ),
                )

        if entry["ma_bn"] and entry["ngay_vao"] and patient_day_counter.get(patient_day_key, 0) > 1 and entry["ma_ly_do_vv"] != "1":
            for row_index, row in enumerate(entry["xml3"]):
                if not isinstance(row, dict) or not is_kham_service(row, dm_kham_runtime):
                    continue
                if to_number(row.get("STT")) < 2:
                    continue
                if to_number(row.get("THANH_TIEN")) <= (to_number(row.get("DON_GIA")) * 0.3):
                    continue
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_13",
                        ten_quy_tac="Khám lại trong ngày (Không cấp cứu)",
                        canh_bao="⚠️ [KIỂM TRA]: Người bệnh khám lại ngay trong ngày (không phải cấp cứu). Lần khám này phải tính theo giá của lần khám thứ 02 trở đi (30%).",
                        noi_dung=(
                            f"Bệnh nhân {entry['ma_bn']} có nhiều hồ sơ trong ngày {entry['ngay_vao']} nhưng dòng khám "
                            f"thứ {int(to_number(row.get('STT')))} vẫn có thanh toán vượt ngưỡng 30%."
                        ),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=row_index,
                        dieu_kien="COUNT_REVISIT(XML1.MA_BN, SUBSTR(XML1.NGAY_VAO, 1, 8)) > 1 AND XML1.MA_LY_DO_VV != '1'",
                    ),
                )

        if entry["ma_bn"] and entry["ngay_vao"] and patient_day_counter.get(patient_day_key, 0) > 1 and entry["ma_ly_do_vv"] == "1":
            for row_index, row in enumerate(entry["xml3"]):
                if not isinstance(row, dict) or not is_kham_service(row, dm_kham_runtime):
                    continue
                if to_number(row.get("THANH_TIEN")) >= to_number(row.get("DON_GIA")):
                    continue
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_40",
                        ten_quy_tac="Cấp cứu không tính công khám lại",
                        canh_bao="⛔ [SAI ĐƠN GIÁ]: Trường hợp cấp cứu được tính là một lần khám mới (100% giá), không tính theo tỷ lệ 30% như khám lại thông thường.",
                        noi_dung=(
                            f"Bệnh nhân {entry['ma_bn']} có nhiều hồ sơ cùng ngày {entry['ngay_vao']} ở diện cấp cứu, "
                            f"nhưng dòng khám vẫn bị tính thấp hơn đơn giá đầy đủ."
                        ),
                        phan_he="XML3",
                        truong_loi="THANH_TIEN",
                        index=row_index,
                        dieu_kien="XML1.MA_LY_DO_VV == '1' AND COUNT_VISIT_IN_DAY(XML1.MA_BN, SUBSTR(XML1.NGAY_VAO, 1, 8)) > 1",
                    ),
                )

        for row_index, row in enumerate(entry["xml3"]):
            if not isinstance(row, dict):
                continue
            if is_kham_service(row, dm_kham_runtime):
                doctor_key_kham = normalize_text(row.get("MA_BAC_SI") or row.get("NGUOI_THUC_HIEN") or row.get("MA_BS"))
                time_key_kham = normalize_time_key(row.get("NGAY_YL") or row.get("NGAY_KQ") or row.get("NGAY_TH_YL"))
                if doctor_key_kham and time_key_kham and doctor_time_counter.get((doctor_key_kham, time_key_kham), 0) > 1:
                    them_canh_bao_khong_trung(
                        ket_qua_giam_dinh,
                        tao_canh_bao(
                            ma_luat="CK_52",
                            ten_quy_tac="Trùng lặp công khám cùng giờ",
                            canh_bao="⛔ [VÔ LÝ]: Một bác sĩ không thể thực hiện khám cho 2 bệnh nhân tại cùng một thời điểm (phút/giây).",
                            noi_dung=(
                                f"Bác sĩ {doctor_key_kham} có công khám trùng thời điểm {time_key_kham} trên nhiều hồ sơ trong batch."
                            ),
                            phan_he="XML3",
                            truong_loi="NGAY_YL",
                            index=row_index,
                            dieu_kien="COUNT_IF(XML3, item => item.MA_DV IN (DM_KHAM) ... SUBSTR(other.NGAY_YL, 1, 12) == SUBSTR(item.NGAY_YL, 1, 12)) > 0",
                        ),
                    )
            doctor_key = normalize_text(row.get("NGUOI_THUC_HIEN") or row.get("MA_BAC_SI") or row.get("MA_BS"))
            time_key = normalize_time_key(row.get("NGAY_YL") or row.get("NGAY_KQ") or row.get("NGAY_TH_YL"))
            day_key = normalize_day_key(row.get("NGAY_YL") or row.get("NGAY_KQ") or row.get("NGAY_TH_YL")) or entry["ngay_vao"]
            if not doctor_key or not time_key:
                continue
            if doctor_time_counter.get((doctor_key, time_key), 0) > 1:
                if la_xml3_loai_tru_ns10_xet_nghiem(row):
                    continue
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="NS_10",
                        ten_quy_tac='BS "Phân thân" - Trùng thời gian thực hiện DVKT (trừ CLS xét nghiệm)',
                        canh_bao='⛔ [XUẤT TOÁN]: BS ({NGUOI_THUC_HIEN}) thực hiện ≥2 DVKT/PTTT cùng thời điểm (NGAY_YL) trên ≥2 bệnh nhân khác nhau. Không áp dụng cho dòng nhóm xét nghiệm (MA_NHOM=2 / tên DVKT xét nghiệm).',
                        noi_dung=(
                            f"Nhân sự {doctor_key} có thời điểm {time_key} xuất hiện "
                            f"{doctor_time_counter[(doctor_key, time_key)]} lần giữa các hồ sơ trong batch."
                        ),
                        phan_he="XML3",
                        truong_loi="NGUOI_THUC_HIEN",
                        index=row_index,
                        dieu_kien="XML3.NGUOI_THUC_HIEN = SAME_BS AND XML3.NGAY_YL OVERLAP ACROSS DIFFERENT XML1.MA_LK AND NOT(XML3 MA_NHOM==2 OR TEN_DICH_VU xét nghiệm)",
                    ),
                )

            if doctor_key and day_key and len(doctor_day_facilities.get((doctor_key, day_key), set())) > 2:
                them_canh_bao_khong_trung(
                    ket_qua_giam_dinh,
                    tao_canh_bao(
                        ma_luat="CK_51",
                        ten_quy_tac="Bác sĩ khám vượt quá 02 cơ sở/ngày",
                        canh_bao="⛔ [VI PHẠM CCHN]: Một bác sĩ không được đăng ký hành nghề và tính công khám tại quá 02 cơ sở y tế trong cùng một ngày.",
                        noi_dung=(
                            f"Nhân sự {doctor_key} xuất hiện tại {len(doctor_day_facilities[(doctor_key, day_key)])} cơ sở "
                            f"trong ngày {day_key} ở batch hiện tại."
                        ),
                        phan_he="XML3",
                        truong_loi="MA_BAC_SI",
                        index=row_index,
                        dieu_kien="COUNT_DISTINCT(XML1.MA_CSKCB WHERE XML3.MA_BAC_SI == {ID} AND SUBSTR(XML1.NGAY_VAO, 1, 8) == SUBSTR(NOW, 1, 8)) > 2",
                    ),
                )

        claim["ket_qua_giam_dinh"] = ket_qua_giam_dinh
        claim["python_service_meta"] = {
            "engine": "python-fastapi",
            "coverage": "partial",
            "timestamp": tao_moc_thoi_gian_iso(),
            "supported_rules": SUPPORTED_RULES,
            "dm_kham_runtime_count": len(dm_kham_runtime),
            "ma_khoa_kham_count": len(ma_khoa_kham_runtime),
            "python_warning_count": sum(
                1 for item in ket_qua_giam_dinh if item.get("nguon_giam_dinh") == PYTHON_SOURCE
            ),
        }
        results.append(claim)

    return {
        "claims": results,
        "duplicates": duplicates,
        "coverage": {
            "mode": "partial",
            "fallback_recommended": True,
            "compatible_claim_results": True,
            "supported_rules": SUPPORTED_RULES,
            "dm_kham_runtime_count": len(dm_kham_runtime),
            "dm_kham_source": "request_options" if dm_kham_runtime else "python_fallback_heuristic",
            "ma_khoa_kham_count": len(ma_khoa_kham_runtime),
            "ma_khoa_kham_source": "request_options" if ma_khoa_kham_runtime else "unavailable",
        },
    }


app = FastAPI(
    title="CDSS BHYT Python Service",
    version="0.1.0",
    description="Python service cho mo hinh lai React Native + FastAPI.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "service": "cdss-bhyt-python-service",
        "status": "ok",
        "timestamp": tao_moc_thoi_gian_iso(),
        "endpoints": [
            "GET /health",
            "POST /api/v1/audit/claims",
            "GET /api/v1/ai/status",
            "POST /api/v1/chat",
        ],
    }


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": "cdss-bhyt-python-service",
        "timestamp": tao_moc_thoi_gian_iso(),
    }


@app.post("/api/v1/audit/claims")
def audit_claims(payload: BatchAuditRequest) -> Dict[str, Any]:
    batch_result = build_python_claim_results(payload.claims, payload.options)

    return {
        "status": "ok",
        "engine": "python-fastapi",
        "received_claims": len(payload.claims),
        "duplicates": batch_result["duplicates"],
        "claims": batch_result["claims"],
        "coverage": batch_result["coverage"],
        "options_echo": payload.options,
        "timestamp": tao_moc_thoi_gian_iso(),
    }


@app.get("/api/v1/ai/status")
def ai_status() -> Dict[str, Any]:
    """Trạng thái tùy chọn LLM (Unsloth-compatible trên Hugging Face)."""
    meta = ai_trang_thai()
    return {
        "status": "ok",
        "timestamp": tao_moc_thoi_gian_iso(),
        **meta,
    }


@app.post("/api/v1/chat")
def chat_endpoint(payload: ChatRequest) -> Dict[str, Any]:
    """
    Chat với mô hình nội bộ (mặc định unsloth/Qwen2.5-3B-Instruct-bnb-4bit).
    Cần GPU + requirements-ai.txt; hoặc CDSS_AI_MOCK=1 để thử luồng.
    """
    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages không được rỗng")
    raw = [m.model_dump() for m in payload.messages]
    try:
        result = ai_sinh_tra_loi(raw, max_new_tokens=payload.max_new_tokens)
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": tao_moc_thoi_gian_iso(),
            **ai_trang_thai(),
        }
    return {
        "status": "ok",
        "timestamp": tao_moc_thoi_gian_iso(),
        "reply": result.get("reply", ""),
        "model_id": result.get("model_id", ""),
        "mock": bool(result.get("mock")),
    }