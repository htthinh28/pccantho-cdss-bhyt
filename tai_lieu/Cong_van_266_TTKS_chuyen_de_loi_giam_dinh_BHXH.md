# Công văn 266 (chuyên đề) — lỗi giám định / từ chối thanh toán BHXH–BHYT

Tài liệu này **đối chiếu** danh mục lỗi mà Trung tâm Kiểm soát thanh toán BHXH, BHYT điện tử dùng trong **chuyên đề giám định** (kèm Công văn 266 dạng `…/TTKS-NV`), cụ thể từ:

- **Phụ lục 01** (`PL1_CD_chuyentinh.docx`): dịch vụ kỹ thuật thanh toán **không đúng quy định** (tách/ghép DVKT theo **điểm a khoản 4 Điều 4 TT 35/2016/TT-BYT**, điều kiện **TT 35/2016** và **TT 39/2024/TT-BYT**, v.v.).
- **Phụ lục 02** (`PL2_CD chuyentinh.docx`): **thuốc** thanh toán không đúng quy định (tham chiếu **TT 20/2022** Phụ lục I, **TT 05/2015** Đông y, **TT 37/2024** Điều 8, thuốc đã kết cấu trong giá DVKT, ngoài danh mục BHYT, …).

File Word gốc thường nằm ngoài repo (ví dụ thư mục Google Drive BHYT). Trong repo đã lưu bản trích chữ thuần và chỉ mục có cấu trúc để tra cứu và bảo trì.

## Mã trong phụ lục

| Ký hiệu | Ý nghĩa thông thường |
|--------|------------------------|
| **KT…** | Mã **chuyên đề** (kỹ thuật / DVKT hoặc nhóm lỗi liên quan kỹ thuật). Có biến thể như `KT01_1`, `KT02P1`. |
| **TH…** | Mã chuyên đề nhóm **thuốc** (Phụ lục 02). |
| **S.xxx.yyy** / **T.xxx.yyy** | **Mã lý do từ chối** (theo hệ thống mã giám định; `S` thường gắn sai phạm về nội dung thanh toán, `T` gắn kỹ thuật/quy trình tùy ngữ cảnh phụ lục). |

Khi đối chiếu với **XML điện tử**: các lỗi thuốc thường liên quan **XML2**; lỗi DVKT thường liên quan **XML3** (và ngữ cảnh PTTT, danh mục kỹ thuật, điều kiện thanh toán từng mã).

## Dữ liệu trong repo

| Đường dẫn | Mô tả |
|-----------|--------|
| `tai_lieu/_extract_cv266/PL1_plain.txt` | Nội dung trích từ Phụ lục 01 (UTF-8). |
| `tai_lieu/_extract_cv266/PL2_plain.txt` | Nội dung trích từ Phụ lục 02 (UTF-8). |
| `tai_lieu/_extract_cv266/cv266_pl_index.json` | Chỉ mục: `maChuyenDe`, `maLyDo`, `noiDung` (rút gọn), `nguon` (`PL1` / `PL2`). |
| `scripts/parse_cv266_phuluc.js` | Parse lại từ hai file `.txt` trên; chạy: `node scripts/parse_cv266_phuluc.js`. |

Số mục (sau lần generate gần đây): khoảng **58** dòng PL1 + **36** dòng PL2, **94** bản ghi duy nhất trong JSON (một số cặp mã + nội dung có thể trùng giữa nguồn nếu trích lỗi; khóa gộp dùng tiền tố nội dung).

## Liên hệ với engine CDSS trong mã nguồn

Luật **giám định chuyên đề** chạy trong ứng dụng lấy từ `ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx`, được sinh từ Excel qua `scripts/gen_hardcoded_rules.js` (sheet `LUAT_GIAM_DINH_CHUYEN_DE`). **Không** chỉnh tay file hardcoded; khi cần bổ sung quy tắc có điều kiện (DIEU_KIEN), cập nhật nguồn Excel rồi generate lại.

File `cv266_pl_index.json` phục vụ **tra cứu, huấn luyện, audit** và đồng bộ nội dung cảnh báo với **mã lý do / mã chuyên đề** mà BHXH công bố trong phụ lục Công văn 266 — không thay thế toàn bộ 600+ luật logic trong Excel trừ khi được map từng mục sang điều kiện kỹ thuật.

## Tái tạo `.txt` từ `.docx` (khi có file gốc)

Trên Windows, nếu đường dẫn tiếng Việt gây lỗi console, có thể: giải nén `word/document.xml` từ `.docx`, chuyển thẻ thành xuống dòng, ghi UTF-8 vào `PL1_plain.txt` / `PL2_plain.txt`, sau đó chạy lại `parse_cv266_phuluc.js`.
