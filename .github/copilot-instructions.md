# CDSS BHYT Workspace Instructions

## Mission

- Luon uu tien giu nguyen chuc nang he thong hien co tru khi nguoi dung yeu cau thay doi hanh vi.
- Tra loi bang tieng Viet.
- Sua tan goc nguyen nhan, tranh va cham vao cac phan khong lien quan.
- Khi co xung dot giua tai lieu va ma nguon, coi ma nguon dang chay la nguon su that uu tien cao nhat va neu ro diem lech.

## Architecture

- Entry point dang chay la `App.jsx` va `index.js`.
- Luong nghiep vu that duoc dieu phoi boi `ma_nguon/dieu_huong/tuyen_duong.jsx`.
- Thu muc `app/` theo Expo Router chu yeu la scaffold, khong mac dinh coi la loi nghiep vu dang hoat dong.
- Loi nghiep vu tap trung trong `ma_nguon/man_hinh`, `ma_nguon/tien_ich`, `ma_nguon/dich_vu`, `ma_nguon/quy_tac`.
- Python service nam o `python_service/app/main.py`; client React Native nam o `ma_nguon/dich_vu/python_service_api.jsx`.

## Domain Guardrails

- Doc tham chieu truoc khi thay doi rong: `tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md`.
- Cac file `luat_*_hardcoded.jsx` thuong la artefact sinh tu Excel; neu can giam tac dong nghiep vu, uu tien bat/tat bang cau hinh on/off thay vi sua tay tung artefact.
- Tren Expo Web, can can than voi quota storage; session tam cua DocXML nen uu tien `sessionStorage` hoac fallback trong bo nho thay vi phu thuoc hoan toan vao local storage ben vung.
- Khi cham vao bao cao, dashboard, DocXML, Sua XML hoac rule engine, phai giu nguyen cac duong di nghiep vu da co tru khi task noi ro can doi luong.

## Working Style

- Truoc khi sua code nghiep vu, xac dinh man hinh dang chay that, utility loi va tang luu tru lien quan.
- Uu tien thay doi nho, co dinh huong, khong doi ten hoac tai cau truc rong neu khong can thiet.
- Khi task lien quan tai lieu, doi chieu voi ma nguon va danh dau ro noi dung nao la suy luan.
- Sau khi sua JS/TS/JSX/TSX, uu tien chay kiem tra muc tieu; neu pham vi rong, chay `npm run lint`.

## Git Rules

- Khong tu y xoa hoac don dep file ngoai pham vi yeu cau.
- Khong rewrite lich su Git hoac xoa du lieu nguoi dung neu chua co chi dao ro rang.
- Khi can push, tom tat ro commit nao da duoc dua len remote.