#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh dataset huấn luyện SFT (JSONL) cho trợ lý CDSS — từ nguồn trong repo.

Định dạng mỗi dòng (Unsloth / Hugging Face trò chuyện):
  {"messages": [{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}

Chạy (từ thư mục gốc repo):
  python scripts/build_sft_dataset_cdss.py
  python scripts/build_sft_dataset_cdss.py --input tai_lieu/Danh_sach_rule_thuoc_chong_chi_dinh.csv --out training_data/generated/sft_chong_chi_dinh.jsonl

Tuỳ chọn --source contra|all (mặc định contra = chỉ CSV chống chỉ định).
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, Iterator, List

REPO = Path(__file__).resolve().parents[1]


def doc_tuan_csv_duong_dan(path: Path) -> Iterator[Dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            yield {k: (v or "").strip() for k, v in row.items()}


def dong_chong_chi_dinh_sft(row: Dict[str, str]) -> Dict[str, Any]:
    ma = row.get("MA_LUAT", "")
    ten = row.get("TEN_QUY_TAC", "")
    dk = row.get("DIEU_KIEN", "")
    cb = row.get("CANH_BAO", "")
    user = (
        f"Giải thích quy tắc giám định thuốc mã {ma} ({ten}). "
        f"Nêu điều kiện kích hoạt và nội dung cảnh báo theo hệ thống CDSS."
    )
    assistant = (
        f"**Mã quy tắc:** {ma}\n"
        f"**Tên:** {ten}\n"
        f"**Điều kiện (logic engine):** {dk}\n"
        f"**Cảnh báo hiển thị:** {cb}\n\n"
        f"*Lưu ý: quyết định thanh toán cuối cùng do engine giám định và quy định BHYT quy định; "
        f"trợ lý chỉ diễn giải nội dung quy tắc đã tích hợp.*"
    )
    return {
        "messages": [
            {"role": "user", "content": user},
            {"role": "assistant", "content": assistant},
        ],
    }


def main() -> None:
    p = argparse.ArgumentParser(description="Sinh JSONL SFT cho CDSS BHYT")
    p.add_argument(
        "--input",
        type=Path,
        default=REPO / "tai_lieu" / "Danh_sach_rule_thuoc_chong_chi_dinh.csv",
        help="CSV quy tắc chống chỉ định",
    )
    p.add_argument(
        "--out",
        type=Path,
        default=REPO / "training_data" / "generated" / "sft_chong_chi_dinh.jsonl",
        help="File JSONL đầu ra",
    )
    p.add_argument("--source", choices=("contra",), default="contra")
    args = p.parse_args()

    if not args.input.is_file():
        print(f"[build_sft] Không tìm thấy: {args.input}", file=sys.stderr)
        sys.exit(1)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with args.out.open("w", encoding="utf-8") as fout:
        for row in doc_tuan_csv_duong_dan(args.input):
            if not row.get("MA_LUAT"):
                continue
            rec = dong_chong_chi_dinh_sft(row)
            fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
            n += 1

    print(f"[build_sft] Đã ghi {n} mẫu → {args.out}")


if __name__ == "__main__":
    main()
