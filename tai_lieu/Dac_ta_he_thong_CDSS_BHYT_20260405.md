# ĐẶC TẢ HỆ THỐNG CDSS BHYT

Phiên bản tài liệu: 3.0  
Ngày cập nhật: 15/04/2026  
Phiên bản ứng dụng tham chiếu: **1.1.0** (`package.json`)  
Phạm vi áp dụng: mã nguồn hiện có trong dự án `ung_dung_cdss_bhyt`

## 1. Mục đích tài liệu

Tài liệu này mô tả lại hệ thống CDSS BHYT theo trạng thái mã nguồn hiện hành, tập trung vào các nội dung sau:

- Xác định mục tiêu, phạm vi và đối tượng sử dụng hệ thống.
- Mô tả kiến trúc kỹ thuật, luồng xử lý và các thành phần tích hợp.
- Chuẩn hóa cách hiểu về các phân hệ nghiệp vụ, kho dữ liệu, rule engine và báo cáo.
- Làm tài liệu bàn giao cho đội phát triển, triển khai, vận hành, kiểm thử và quản trị ứng dụng.
- Tạo mốc tham chiếu khi mở rộng chức năng hoặc đánh giá rủi ro thay đổi.

## 2. Phạm vi hệ thống

CDSS BHYT là ứng dụng hỗ trợ tiếp nhận, kiểm tra, lưu trữ, rà soát và thống kê hồ sơ XML BHYT theo định hướng local-first. Hệ thống đang được triển khai với giao diện React Native và có khả năng mở rộng lai với dịch vụ Python FastAPI cho các tác vụ xử lý nặng hoặc AI.

Phạm vi nghiệp vụ chính gồm:

- Đăng nhập và quản trị phiên làm việc.
- Phân quyền người dùng theo vai trò và ma trận RBAC.
- Nhập hồ sơ XML BHYT và bóc tách dữ liệu XML1 đến XML6.
- Kiểm tra lỗi hành chính, dữ liệu, logic thời gian, đối chiếu chi phí và các quy tắc nghiệp vụ.
- Quản lý kho lưu trữ hồ sơ đã nhập.
- Quản lý danh mục nội bộ, danh mục Bộ Y tế và các bộ luật kiểm tra.
- Theo dõi báo cáo, thống kê chất lượng dữ liệu và xuất Excel.
- Sao lưu, phục hồi và đồng bộ cấu hình/dataset với Firebase khi cần.
- Kết nối HIS và Python service trong mô hình lai.
- **Thư viện tài liệu** nội bộ (đồng bộ từ `tai_lieu/` ra giao diện web/app) và **Trợ lý tri thức (RAG)** khi bật cấu hình.
- **Mapping danh mục nghiệp vụ** (catalog mapping) phục vụ đối chiếu mã giữa hệ thống nội bộ và chuẩn dùng chung.
- **Đóng gói desktop** (Electron): bản cài NSIS hoặc bản **portable** Windows (`.exe` không cài đặt), xuất từ `dist` web đã `expo export`.
- **Cập nhật offline** (tùy triển khai): gói vá hoặc công cụ cập nhật phần giao diện tĩnh — xem `tai_lieu/HUONG_DAN_NANG_CAP_OFFLINE.txt` và script `desktop:*` trong `package.json`.
- **Chuyên môn:** phân hệ phác đồ / chuyên môn; module **tương tác thuốc** (`ma_nguon/chuyen_mon/tuong_tac_thuoc/`) phục vụ rà soát tương tác và quy tắc liên quan khi được cấu hình.

Ngoài phạm vi tài liệu này:

- Không mô tả chi tiết từng rule nghiệp vụ cấp vi mô trong mọi bảng luật.
- Không thay thế tài liệu nghiệp vụ pháp lý của QĐ 130, QĐ 3176 hoặc các công văn chuyên ngành.
- Không mô tả chi tiết quy trình DevOps cloud production ngoài các thông số đang thể hiện trong repo.

## 3. Đối tượng sử dụng tài liệu

- Ban triển khai và quản trị hệ thống tại đơn vị.
- Lập trình viên bảo trì và mở rộng ứng dụng.
- Kiểm thử viên cần hiểu luồng dữ liệu và điểm kiểm soát.
- Nhân sự phụ trách dữ liệu, danh mục, rule engine và báo cáo.
- Lãnh đạo kỹ thuật cần nắm cấu trúc tổng thể trước khi phê duyệt thay đổi.

## 4. Từ điển khái niệm

- CDSS: Clinical Decision Support System, trong dự án này là hệ thống hỗ trợ kiểm soát và rà soát hồ sơ BHYT.
- XML1 đến XML6: các bảng dữ liệu chuẩn tách ra từ hồ sơ XML BHYT mà ứng dụng đang quản lý trực tiếp trong màn hình nghiệp vụ hiện hành.
- Rule engine: cơ chế đánh giá tập luật nhằm phát hiện lỗi dữ liệu, lỗi logic, bất thường chi phí và cảnh báo giám định.
- Hardcoded rules: tập luật sinh từ Excel hoặc viết cố định theo chuyên đề, thường nằm trong các file `luat_*_hardcoded.jsx`.
- Dynamic rules: tập luật dạng dữ liệu, lưu thành seed/dataset và được biên dịch theo DSL nội bộ bởi `dong_co_giam_dinh.jsx`.
- Local-first: dữ liệu được ưu tiên lưu và xử lý tại máy người dùng trước, cloud đóng vai trò đồng bộ/phục hồi.
- Kho hồ sơ: nơi lưu toàn bộ hồ sơ XML đã nhập, đã kiểm tra hoặc đang theo dõi.

## 5. Mục tiêu vận hành

Hệ thống được xây dựng để giải quyết các nhu cầu sau:

- Giảm lỗi dữ liệu trong hồ sơ XML BHYT trước khi gửi hoặc đối soát.
- Hỗ trợ rà soát các bất thường chi phí và quy tắc giám định ngay tại đơn vị.
- Tập trung hóa các bộ luật, danh mục và cấu hình quản trị trong một ứng dụng thống nhất.
- Cho phép kiểm tra lại hồ sơ sau khi chỉnh sửa mà không phụ thuộc hoàn toàn vào hệ thống ngoài.
- Theo dõi xu hướng lỗi theo khoa, bác sĩ, quy tắc và chi phí ảnh hưởng.

## 6. Tổng quan công nghệ

### 6.1. Nền tảng chính

- React Native 0.81.5.
- React 19.1.0.
- Expo SDK 54.
- React Navigation Native Stack.
- Web runtime qua `react-native-web`.

### 6.2. Lưu trữ và dữ liệu

- Web: IndexedDB làm kho dữ liệu chính.
- Mobile: AsyncStorage với cơ chế index-detail để tránh giới hạn dung lượng theo key.
- Firebase Firestore và Firebase Auth dùng cho đồng bộ dataset và lưu metadata cloud.
- Tệp Excel được xử lý qua thư viện `xlsx`.

### 6.3. Tích hợp ngoài

- Firebase cho đồng bộ dữ liệu cấu hình, dataset và metadata hồ sơ.
- HIS qua REST/WebSocket theo cấu hình trong `app.json`.
- Python FastAPI cho audit batch hoặc xử lý mở rộng.

### 6.4. Đóng gói desktop (Electron)

- **Electron** (phiên bản cố định trong quy trình đóng gói, ví dụ 35.7.x) + **electron-builder**, cấu hình `electron-builder.desktop.yml`.
- Luồng chuẩn: `npm run tai_lieu:prepare` → `expo export --platform web` → tạo thư mục staging `.desktop-staging` (chỉ `dist`, `electron-main.cjs`, `package.json` tối giản) → `electron-builder` ghi artifact (mặc định có thể dùng `%TEMP%\cdss-bhyt-release-desktop` hoặc `CDSS_RELEASE_OUT`).
- Target Windows: **portable** (một file `.exe` chạy trực tiếp) và/hoặc **NSIS** (bản cài). Chi tiết vận hành: `packaging/HUONG_DAN_BAN_PORTABLE_DAY_DU.txt`.

### 6.5. Thông tin cấu hình nền tảng

- Tên ứng dụng: `CDSS BHYT Phuong Chau`.
- Gói Android: `com.phuongchau.cdss.bhyt`.
- Bundle iOS: `com.phuongchau.cdss.bhyt`.
- Chế độ giao diện: `light`.

## 7. Cấu trúc mã nguồn ở mức cao

### 7.1. Điểm vào thực tế

Điểm vào đang dùng trong thực tế là `App.jsx` và `index.js`. Theo kiến trúc hiện hành:

- `App.jsx` là entry point ứng dụng đang hoạt động.
- `ma_nguon/dieu_huong/tuyen_duong.jsx` điều phối toàn bộ màn hình nghiệp vụ thật.
- Thư mục `app/` theo Expo Router vẫn còn chủ yếu là scaffold/starter template, chưa phải lõi nghiệp vụ đang chạy.

### 7.2. Thư mục trọng yếu

- `ma_nguon/man_hinh`: giao diện nghiệp vụ chính.
- `ma_nguon/tien_ich`: engine, lưu trữ, Firebase, RBAC, XML helper, import/export và nhiều tiện ích lõi.
- `ma_nguon/dich_vu`: lớp gọi dịch vụ bên ngoài, gồm client cho Python service.
- `ma_nguon/quy_tac`: dữ liệu chuẩn tham chiếu cấu trúc XML và tập luật chuyên biệt.
- `python_service`: dịch vụ FastAPI dùng cho mô hình lai.
- `scripts`: script kiểm tra, audit, generate dữ liệu, smoke test và hỗ trợ vận hành.
- `tai_lieu`: tài liệu Markdown/HTML phục vụ Thư viện; sau chỉnh sửa chạy `npm run tai_lieu:prepare` để đồng bộ `public/tai_lieu/` và `tai_lieu_manifest.json`.
- `ma_nguon/chuyen_mon`: module chuyên môn (ví dụ tương tác thuốc).
- `tai_nguyen`: ảnh, biểu tượng và tài nguyên dùng cho app.
- `test_xml`: dữ liệu kết quả audit và mẫu chạy kiểm thử thực tế.

## 8. Kiến trúc logic của hệ thống

Hệ thống có thể xem như gồm 5 lớp chính.

### 8.1. Lớp giao diện

Thành phần chính:

- Các màn hình trong `ma_nguon/man_hinh`.
- Dashboard điều hướng vào từng phân hệ.
- Màn hình đọc XML, chi tiết ca bệnh, kho lưu trữ, báo cáo, quản trị luật, danh mục, phân quyền.

Trách nhiệm:

- Nhập và hiển thị dữ liệu.
- Gọi các utility xử lý cục bộ.
- Điều hướng theo quyền được cấp.
- Hiển thị cảnh báo, kết quả kiểm tra và trạng thái đồng bộ.

### 8.2. Lớp điều hướng và kiểm soát truy cập

Thành phần chính:

- `ma_nguon/dieu_huong/tuyen_duong.jsx`.
- `ma_nguon/tien_ich/phien_dang_nhap.jsx`.
- `ma_nguon/tien_ich/rbac_engine.jsx`.

Trách nhiệm:

- Kiểm tra phiên đăng nhập hợp lệ.
- Khôi phục trạng thái điều hướng đã lưu.
- Áp deep linking trên web và mobile.
- Chặn truy cập vào màn hình không đủ quyền.
- Ép người dùng chưa đăng nhập quay về màn hình đăng nhập.

### 8.3. Lớp nghiệp vụ và đánh giá luật

Thành phần chính:

- `dong_co_giam_dinh.jsx`.
- `dvkt_op_giam_dinh.jsx`.
- Các file seed luật dữ liệu và luật chuyên đề.
- Các module hardcoded theo lĩnh vực.

Trách nhiệm:

- Nhận dữ liệu hồ sơ đã chuẩn hóa.
- Áp điều kiện rule hardcoded hoặc dynamic.
- Gộp cảnh báo, phân mức độ và chuẩn hóa đầu ra cho UI/báo cáo.
- Bổ sung metadata giải trình rule ở đầu ra, tối thiểu gồm `namespace_quy_tac`, `nguon_quy_tac`, `luong_giai_trinh`, `tab_quan_tri_goi_y` cho các họ rule XML3 khi có thể suy luận an toàn.

### 8.4. Lớp lưu trữ cục bộ

Thành phần chính:

- `kho_du_lieu.jsx`.
- AsyncStorage.
- IndexedDB.

Trách nhiệm:

- Lưu hồ sơ theo `MA_LK`.
- Truy xuất toàn bộ, truy xuất nhiều hồ sơ hoặc xóa hồ sơ.
- Migration dữ liệu cũ từ localStorage sang IndexedDB trên web.
- Lưu các dataset cấu hình, danh mục và metadata đồng bộ.

### 8.5. Lớp tích hợp ngoài

Thành phần chính:

- `firebase_cloud_bhyt.jsx`.
- `python_service/app/main.py`.
- `ma_nguon/dich_vu/python_service_api.jsx`.

Trách nhiệm:

- Xác thực Firebase.
- Đồng bộ dataset rule engine và metadata hồ sơ lên cloud.
- Đọc dữ liệu từ cloud về cục bộ.
- Gọi Python service cho audit batch hoặc smoke test.
- Kết nối HIS theo cấu hình runtime.

## 9. Điều hướng và bản đồ màn hình

Theo `tuyen_duong.jsx`, hệ thống đang khai báo các route nghiệp vụ sau (thứ tự nhóm):

**Truy cập & hệ thống:** `DangNhap`, `TongQuan`, `Helper`, `PhanQuyenTruyCap`.

**Kiểm tra hồ sơ:** `DocXML`, `ChiTiet`, `SuaFileXML`, `KhoLuuTru`.

**Quản trị dữ liệu & danh mục:** `QuanLyLuat`, `QuanLyQuyTacOnOff`, `QuanLyDanhMuc`, `MappingNghiepVu`, `DanhMucBYTMain`, `QuanLyChuyenMon`, `ThuVien`, `TriThucTuGiamDinh`, `TroLyTriThuc`, `CongHIS`.

**Báo cáo:** `BaoCaoVaThongKe`.

**XML chi tiết (QĐ 130):** `XML1` … `XML6`.

Deep link (web) — tham chiếu `cauHinhLienKet` trong `tuyen_duong.jsx`:

| Route | Path web |
|-------|----------|
| `DangNhap` | `/login` |
| `TongQuan` | `/dashboard` |
| `Helper` | `/helper` |
| `DocXML` | `/auditing` |
| `ChiTiet` | `/case-detail/:maLK` |
| `SuaFileXML` | `/auditing/edit/:maLK` |
| `KhoLuuTru` | `/archive` |
| `QuanLyLuat` | `/rules` |
| `QuanLyQuyTacOnOff` | `/rules/on-off` |
| `QuanLyDanhMuc` | `/master-data` |
| `MappingNghiepVu` | `/mapping-nghiep-vu` |
| `DanhMucBYTMain` | `/danh-muc-byt` |
| `QuanLyChuyenMon` | `/clinical-guidelines` |
| `ThuVien` | `/thu-vien` |
| `TriThucTuGiamDinh` | `/tri-thuc-giam-dinh` |
| `TroLyTriThuc` | `/tro-ly-tri-thuc` |
| `CongHIS` | `/his-gateway` |
| `BaoCaoVaThongKe` | `/reports` |
| `XML1` … `XML6` | `/xml/xml1` … `/xml/xml6` |
| `PhanQuyenTruyCap` | `/permissions` |

## 10. Mô tả các phân hệ chức năng

### 10.1. Đăng nhập và quản lý phiên

Chức năng chính:

- Xác thực người dùng.
- Khởi tạo phiên làm việc.
- Khôi phục phiên khi mở lại ứng dụng.
- Chuyển hướng theo trạng thái đăng nhập.

Yêu cầu chính:

- Tài khoản phải tồn tại và đủ quyền.
- Email được chuẩn hóa khi kiểm tra RBAC.
- Người dùng không hợp lệ không được đi thẳng vào màn hình nội bộ qua deep link.

### 10.2. Tổng quan

Chức năng chính:

- Là màn hình hub sau đăng nhập.
- Điều hướng tới các phân hệ được cấp quyền.
- Hiển thị nhóm chức năng cốt lõi theo vai trò.

### 10.3. Helper hệ thống

Chức năng chính:

- Kiểm tra khả năng đọc/ghi Firebase.
- Đồng bộ cấu hình, danh mục hoặc dataset lên Firebase.
- Tải dữ liệu cloud về cục bộ.
- Sao lưu và phục hồi dữ liệu hệ thống.
- Hỗ trợ vận hành và chẩn đoán sự cố.

### 10.4. Phân quyền truy cập

Chức năng chính:

- Tạo và khóa tài khoản.
- Gán vai trò hoặc binding quyền cho người dùng.
- Quản lý matrix quyền theo màn hình/tác vụ.
- Ép `ROLE_ADMIN` có full quyền ở cả UI và engine.

### 10.5. Đọc XML và kiểm tra hồ sơ

Chức năng chính:

- Chọn tệp XML đầu vào.
- Bóc tách XML1 đến XML6.
- Chuẩn hóa dữ liệu đầu vào.
- Chạy kiểm tra rule engine.
- Hiển thị lỗi, cảnh báo, mức độ và rule vi phạm.

Lưu ý kỹ thuật:

- Có chế độ tương thích ngược cho dashboard và màn hình nhập XML.
- Batch dashboard đi qua `chayBoMayGiamDinhNhieuHoSoV3`.

### 10.6. Chi tiết ca bệnh và sửa XML

Chức năng chính:

- Xem hồ sơ đã nhập theo `MA_LK`.
- Hiển thị dữ liệu từng bảng XML.
- Chỉnh sửa một số trường cần hiệu chỉnh.
- Chạy lại kiểm tra sau chỉnh sửa.

### 10.7. Kho lưu trữ

Chức năng chính:

- Lưu toàn bộ hồ sơ theo mã liên kết.
- Tìm kiếm, lọc, thống kê hồ sơ đang có.
- Là nguồn dữ liệu cho báo cáo và tái giám định.

### 10.8. Quản lý luật và quy tắc ON/OFF

Chức năng chính:

- Hiển thị dataset luật hiện hành.
- Bật/tắt rule nội bộ.
- Quản trị luật hardcoded theo nhóm.
- Quản trị seed luật dữ liệu.

Nguyên tắc bảo trì:

- Khi cần giảm nhiễu hoặc vô hiệu hóa rule hardcoded, ưu tiên chỉnh trạng thái ON/OFF trong dữ liệu cấu hình thay vì sửa tay vào artefact sinh từ Excel.

### 10.9. Quản lý danh mục và danh mục Bộ Y tế

Chức năng chính:

- Quản trị danh mục nội bộ.
- Đồng bộ hoặc kiểm tra đối chiếu danh mục chuẩn.
- Quản lý danh mục dùng chung Bộ Y tế theo module hiện hành.

### 10.10. Quản lý chuyên môn

Chức năng chính:

- Quản lý phác đồ, quy trình hoặc nội dung chuyên môn hỗ trợ kiểm tra.
- Kết nối với các rule chuyên đề khi cần.

### 10.11. Báo cáo và thống kê

Chức năng chính:

- Tổng hợp hồ sơ trong kho theo khoảng thời gian.
- Thống kê theo khoa, bác sĩ, quy tắc và xu hướng.
- Tính chi phí ảnh hưởng ước tính.
- Xuất Excel đa sheet.

### 10.12. XML1 đến XML6

Chức năng chính:

- Quản trị từng lớp dữ liệu XML chuẩn.
- Cho phép rà soát chi tiết từng bảng.
- Hỗ trợ đối chiếu cấu trúc và trường dữ liệu.

### 10.13. Mapping nghiệp vụ (`MappingNghiepVu`)

- Ánh xạ danh mục / mã nghiệp vụ giữa kho nội bộ và chuẩn dùng trong giám định (theo module triển khai).

### 10.14. Thư viện (`ThuVien`)

- Hiển thị tài liệu đã chuẩn bị trong `tai_lieu/` (sau `npm run tai_lieu:prepare`).

### 10.15. Tri thức từ giám định (`TriThucTuGiamDinh`)

- Khai thác tri thức / gợi ý gắn với kết quả giám định (theo thiết kế màn hình).

### 10.16. Trợ lý tri thức (`TroLyTriThuc`)

- Trợ lý hội thoại / RAG trên corpus tài liệu nội bộ khi được cấu hình.

### 10.17. Cổng tiếp nhận HIS (`CongHIS`)

- Kết nối hoặc kiểm tra luồng dữ liệu từ HIS theo cấu hình `app.json` (REST/WebSocket).

## 11. Luồng xử lý nghiệp vụ end-to-end

### 11.1. Luồng khởi động

1. Người dùng mở ứng dụng.
2. `App.jsx` khởi tạo theme, font và container.
3. `DieuHuongChinh` đọc trạng thái điều hướng đã lưu.
4. Hệ thống kiểm tra phiên đăng nhập.
5. Nếu có deep link hoặc route không hợp lệ, hệ thống điều chỉnh về màn hình hợp lệ theo quyền.

### 11.2. Luồng nhập và kiểm tra hồ sơ

1. Người dùng vào `DocXML`.
2. Chọn một hoặc nhiều tệp XML.
3. Hệ thống bóc tách dữ liệu XML1 đến XML6.
4. Dữ liệu được chuẩn hóa và đóng gói thành hồ sơ nội bộ.
5. Rule engine được kích hoạt để đánh giá dữ liệu.
6. Kết quả lỗi/cảnh báo trả về UI.
7. Người dùng có thể lưu vào kho hoặc tiếp tục chỉnh sửa.

### 11.3. Luồng lưu kho

1. Hồ sơ hợp lệ hoặc cần theo dõi được lưu theo `MA_LK`.
2. Trên web, dữ liệu ghi vào IndexedDB store `ho_so`.
3. Trên mobile, dữ liệu ghi vào AsyncStorage theo mô hình index-detail.
4. Kho lưu trữ trở thành nguồn dữ liệu đầu vào cho báo cáo và truy xuất sau này.

### 11.4. Luồng báo cáo

1. Module báo cáo đọc toàn bộ hồ sơ từ kho.
2. Áp bộ lọc thời gian và nhóm lỗi.
3. Tính KPI, tỷ lệ lỗi, chi phí ảnh hưởng và xu hướng.
4. Hiển thị dữ liệu theo tab.
5. Cho phép xuất Excel.

### 11.5. Luồng đồng bộ cloud

1. Người dùng quản trị mở `Helper`.
2. Hệ thống đọc cấu hình Firebase trong runtime.
3. Xác thực anonymous hoặc email/password tùy cấu hình.
4. Dataset được chunk và ghi lên Firestore.
5. Metadata hash/row_count được lưu cả cục bộ lẫn cloud để đối chiếu trạng thái đồng bộ.

## 12. Lưu trữ dữ liệu nội bộ

### 12.1. Nguyên tắc chung

- Lưu trữ cục bộ là nguồn làm việc chính.
- Mọi thao tác phải hoạt động ổn định ngay cả khi không có cloud.
- Dữ liệu cấu hình và metadata cloud chỉ bổ trợ cho đồng bộ/phục hồi.

### 12.2. Web: IndexedDB

Theo `kho_du_lieu.jsx`:

- Tên DB: `CDSS_HO_SO_DB`.
- Store hồ sơ: `ho_so` với key path `ma_lk`.
- Store danh mục: `danh_muc` với key path `key`.
- Có cơ chế mở DB, put, bulkPut, getAll, getMany, delete, clear.

### 12.3. Mobile: AsyncStorage

Nguyên tắc:

- Dùng AsyncStorage làm kho chính trên mobile.
- Áp cấu trúc index-detail để tránh vượt giới hạn dung lượng trên từng key.
- Lưu thêm trạng thái phiên, RBAC, metadata dataset và các cấu hình phụ trợ.

### 12.4. Migration dữ liệu cũ

`kho_du_lieu.jsx` đã có cơ chế migration localStorage sang IndexedDB trên web:

- Chạy một lần duy nhất.
- Đọc index cũ `CDSS_KHO_INDEX_MA_LK`.
- Di chuyển từng hồ sơ sang IndexedDB.
- Xóa key cũ khỏi localStorage sau khi migrate xong.

## 13. Kiến trúc rule engine

### 13.1. Nhóm rule đang tồn tại

- Hardcoded rules sinh từ Excel hoặc chuyên đề.
- Dynamic data rules lưu trong các file seed/dataset.
- Rule no-code cho DVKT.
- Rule batch/liên hồ sơ theo custom evaluator.

### 13.2. Vai trò của engine động

`dong_co_giam_dinh.jsx` đóng vai trò biên dịch và thực thi các biểu thức điều kiện theo DSL nội bộ. Engine hiện hỗ trợ batch context cho nhiều hồ sơ cùng đợt và các evaluator đặc thù ở một số nhóm rule.

### 13.3. Dữ liệu đầu vào của engine

- XML1 đến XML15 ở mức logic engine.
- Dataset chuẩn hóa từ hồ sơ đã nhập.
- Danh mục và tham số hỗ trợ đánh giá.

### 13.4. Quản trị seed luật

Seed luật dữ liệu không chỉ nằm ở file dữ liệu mà còn phụ thuộc vào cơ chế migration seed. Khi chỉnh sửa seed cần đảm bảo danh sách `MA_LUAT_CAN_CAP_NHAT` hoặc `MA_LUAT_CAN_XOA` được cập nhật để dữ liệu đã lưu cũ cũng nhận thay đổi.

### 13.5. Một số quy tắc đối chiếu tiền tệ điển hình (LUAT_DU_LIEU — minh họa)

Các mã sau minh họa **cách hệ thống kiểm tra đồng bộ số liệu** giữa XML1 và chi tiết; biểu thức cụ thể nằm trong seed `du_lieu_luat_du_lieu_muc1.jsx` và có thể được quản trị ON/OFF:

| Mã | Ý nghĩa ngắn |
|----|----------------|
| **XML_49** | So `XML1.T_BHTT` với tổng `T_BHTT` trên các dòng XML2/XML3 (chỉ cộng dòng có `T_BHTT` không rỗng). Cảnh báo khi \|chênh\| > 1 (đồng). |
| **XML_53** | So `XML1.T_THUOC` với tổng tiền thuốc trên XML2 (nhóm `MA_NHOM` 4, 5): cộng dồn theo thứ tự ưu tiên trên dòng — `THANH_TIEN_BH` → `THANH_TIEN` → `THANH_TIEN_BV` → `T_BHTT` (cùng logic ưu tiên với built-in đối chiếu tổng tiền thuốc). |
| **XML_109** | Cảnh báo khi **tổng** `THANH_TIEN_BH` (XML2+XML3) > **tổng** `THANH_TIEN_BV` (tức tổng phần BHYT vượt tổng phần BV ở mức gộp). |
| **XML_143** | Kiểm tra **từng dòng** XML2/XML3: nếu có đủ `THANH_TIEN_BH` và `THANH_TIEN_BV` mà `THANH_TIEN_BH` vượt `THANH_TIEN_BV` quá ngưỡng (chênh > 1đ) thì báo — thành tiền BHYT không được cao hơn thành tiền BV trên cùng dòng. |

Ngoài ra, engine built-in (`dong_co_giam_dinh.jsx`) có thể sinh cảnh báo **CLN-CHI-01** (đối chiếu tổng tiền thuốc) với cách lấy tiền dòng tương thích — cần phân biệt nguồn rule khi truy vết.

### 13.6. Chuẩn hóa đầu ra XML3 và rule legacy

- Từ lớp hậu xử lý của engine, cảnh báo XML3 được phép gắn thêm metadata mô tả nguồn rule mà không làm đổi thứ tự chạy hoặc điều kiện đánh giá.
- Các trường metadata chuẩn hóa đầu ra gồm:
	- `namespace_quy_tac`: nhóm logic nguồn của rule, ví dụ `DVKT_OP`, `CDHA_HARDCODED`, `PTTT_BUILTIN`, `GIAM_DINH_CHUYEN_DE`.
	- `nguon_quy_tac`: module sinh rule/cảnh báo.
	- `luong_giai_trinh`: mô tả ngắn đường đi đánh giá để phục vụ UI, báo cáo hoặc audit.
	- `tab_quan_tri_goi_y`: tab quản trị rule gần nhất có liên quan khi cần truy vết.
- Với các rule hardcoded legacy có cú pháp cũ hoặc alias dữ liệu cũ, hệ thống ưu tiên bổ sung metadata như `BIEU_THUC_CHUAN_HOA` thay vì sửa trực tiếp `DIEU_KIEN` nếu việc sửa có nguy cơ làm đổi hành vi runtime.
- Nguyên tắc bắt buộc: chuẩn hóa rule chỉ được phép tác động đến metadata giải thích hoặc biểu thức tham chiếu; không được làm đổi kết quả đánh giá hiện hành nếu chưa có migration nghiệp vụ tương ứng.

## 14. Tích hợp Firebase

### 14.1. Mục đích

- Đồng bộ dataset rule engine.
- Lưu metadata dataset cục bộ và cloud.
- Hỗ trợ upload hồ sơ XML và đồng bộ dữ liệu khi cần.

### 14.2. Nguồn cấu hình

Cấu hình được đọc từ:

- `app.json`.
- `expo.extra.firebase` runtime.
- Biến môi trường `EXPO_PUBLIC_*` khi có.

### 14.3. Thông số logic cấu hình

Các trường quan trọng:

- `enabled`.
- `orgId`.
- `authMode`.
- `authEmail`.
- `authPassword`.
- `apiKey`.
- `authDomain`.
- `projectId`.
- `storageBucket`.
- `messagingSenderId`.
- `appId`.

### 14.4. Cơ chế kỹ thuật

- Tự resolve cấu hình ưu tiên từ runtime.
- Hỗ trợ đăng nhập anonymous hoặc email/password.
- Chuẩn hóa dataset key bằng token an toàn.
- Lưu `payload_hash`, `row_count`, `payload_bytes`, `updated_at`, `synced_at` ở local meta.
- Chia chunk dữ liệu trước khi ghi cloud để tránh giới hạn Firestore.

## 15. Tích hợp HIS

Theo `app.json`, hệ thống có cấu hình HIS gồm:

- `restBaseUrl`.
- `websocketUrl`.
- `timeoutMs`.
- `reconnectDelayMs`.

Vai trò:

- Phục vụ tích hợp dữ liệu HIS theo thời gian thực hoặc theo API.
- Cho phép mở rộng luồng tiếp nhận hồ sơ từ nguồn HIS thay vì chỉ nhập file.

## 16. Tích hợp Python service

### 16.1. Mục đích

Python service được đưa vào như một lớp xử lý mở rộng cho mô hình hybrid:

- Giữ UI và local workflow ở React Native/Expo.
- Đẩy các tác vụ xử lý nặng, audit batch hoặc AI sang FastAPI.

### 16.2. Thành phần chính

- `python_service/app/main.py`.
- `python_service/requirements.txt`.
- `ma_nguon/dich_vu/python_service_api.jsx`.

### 16.3. API mẫu đang có

- `GET /health`.
- `POST /api/v1/audit/claims`.

### 16.4. Năng lực hiện tại

- Kiểm tra trùng `MA_LK` trong batch.
- Trả timestamp xử lý.
- Áp một số rule Python side theo danh sách `SUPPORTED_RULES`.
- Là scaffold an toàn để chuyển dần xử lý từ app sang service mà không phá luồng cục bộ.

## 17. Bảo mật và phân quyền

### 17.1. Nguyên tắc truy cập

- Mọi màn hình quan trọng đều đi qua kiểm tra phiên và RBAC.
- Người dùng chưa đăng nhập không được truy cập phân hệ nội bộ qua deep link.
- Người dùng đã đăng nhập nhưng không đủ quyền sẽ bị điều hướng về `TongQuan`.

### 17.2. RBAC

RBAC gồm:

- Vai trò mặc định.
- Binding người dùng cụ thể theo email.
- Quyền theo màn hình/tác vụ.
- Cơ chế cưỡng bức `ROLE_ADMIN` full quyền.

### 17.3. Cloud security

- Firestore rules phải được deploy riêng.
- Vai trò đọc cloud cho Firebase hiện chấp nhận các role như `ADMIN`, `AUDITOR`, `OPERATOR`, `REVIEWER`, `USER`.
- Vai trò ghi cloud chặt hơn, chủ yếu là `ADMIN`, `AUDITOR`, `OPERATOR`.

## 18. Vận hành và lệnh kỹ thuật

Các lệnh chính hiện có trong `package.json` (trích — xem file đầy đủ):

```bash
npm install
npm run start
npm run web
npm run android
npm run ios
npm run lint
npm run text:check
npm run tai_lieu:prepare
npm run py:install
npm run py:start
npm run qa:python-service
npm run qa:xml-real
npm run qa:strict-flow
npm run firebase:deploy-rules
npm run firebase:emulators
# Đóng gói desktop (sau khi cài electron / devDependencies)
npm run desktop:export
npm run desktop:build:win
npm run desktop:build:win-portable
npm run desktop:electron
```

**Ghi chú:** Ứng dụng có thể **warm-up** kết nối Python service ngay sau khi shell sẵn sàng (`tuyen_duong.jsx`) — không thay thế cấu hình URL service trong Helper/hybrid.

## 19. Yêu cầu phi chức năng

### 19.1. Khả năng dùng trên nhiều nền tảng

- Web phải chạy ổn định qua Expo Web.
- Mobile dùng cùng codebase React Native.
- Deep link cần hoạt động cho cả local web và scheme mobile.

### 19.2. Khả năng lưu trữ

- Web phải đáp ứng hàng nghìn hồ sơ XML thông qua IndexedDB.
- Ứng dụng không được phụ thuộc tuyệt đối vào cloud để thao tác nghiệp vụ hàng ngày.

### 19.3. Khả năng mở rộng

- Có thể thêm rule mới theo seed hoặc module hardcoded.
- Có thể chuyển dần xử lý nặng sang Python service.
- Có thể mở rộng nguồn dữ liệu từ nhập file sang HIS realtime.

### 19.4. Khả năng bảo trì

- Cấu trúc mã nghiệp vụ tập trung trong `ma_nguon`.
- Script QA và text checks hỗ trợ kiểm soát lỗi encoding/diacritics.
- Tài liệu phải được cập nhật đồng bộ khi có thay đổi route, lưu trữ hoặc tích hợp.

## 20. Ràng buộc và giới hạn hiện tại

- Thư mục `app/` chưa phản ánh đầy đủ luồng nghiệp vụ thật, nên tài liệu kỹ thuật phải ưu tiên `App.jsx` và `ma_nguon`.
- Một phần rule engine dùng dữ liệu sinh từ Excel, có nguy cơ sinh artefact khó đọc hoặc khó bảo trì thủ công.
- Không phải mọi rule DSL đều an toàn nếu biểu thức seed không phù hợp cú pháp engine.
- Cấu hình Firebase/HIS hiện nằm trong app config nên cần quy trình quản trị secrets chặt hơn khi triển khai production rộng.

## 21. Rủi ro kỹ thuật cần theo dõi

- Chỉnh seed luật mà quên migration seed sẽ làm dữ liệu cũ không cập nhật.
- Bổ sung màn hình mới mà quên khai báo RBAC hoặc deep link sẽ gây truy cập lệch.
- Phụ thuộc quá nhiều vào artefact hardcoded sinh từ Excel có thể làm khó kiểm soát thay đổi theo thời gian.
- Đồng bộ cloud không đúng quyền có thể gây ghi đè dataset hoặc rò rỉ dữ liệu cấu hình.
- Sự chênh lệch giữa schema pháp lý và field nội bộ nếu không được rà soát định kỳ sẽ làm tăng false positive/false negative.

## 22. Đề xuất cải tiến

- Tách rõ tài liệu dành cho người dùng cuối, quản trị viên và đội kỹ thuật.
- Duy trì changelog riêng cho dataset luật và migration seed.
- Chuẩn hóa bộ test regression cho các rule trọng yếu trước mỗi lần phát hành.
- Rà soát dần để đưa các cấu hình nhạy cảm sang secret manager hoặc môi trường an toàn hơn.
- Cân nhắc gom lại các điểm nhập XML/sửa XML để giảm trùng lặp giao diện trong tương lai.

## 23. Tiêu chí nghiệm thu tài liệu này

Tài liệu được xem là đạt khi:

- Phản ánh đúng entry point, route và cấu trúc phân hệ đang chạy.
- Mô tả đầy đủ lưu trữ web/mobile, tích hợp Firebase và Python service.
- Chỉ rõ vai trò của rule engine, dataset và migration seed.
- Hỗ trợ đội kỹ thuật hiểu luồng end-to-end mà không phải suy diễn từ mã nguồn rời rạc.

## 24. Kết luận

CDSS BHYT hiện là một hệ thống local-first đa phân hệ, lấy React Native/Expo làm lớp giao diện, IndexedDB/AsyncStorage làm nền tảng dữ liệu cục bộ, Firebase làm lớp đồng bộ, và đang mở rộng theo hướng hybrid với Python service. Giá trị cốt lõi của hệ thống nằm ở khả năng nhập XML, chuẩn hóa dữ liệu, áp rule engine, lưu kho hồ sơ và tổng hợp báo cáo chất lượng. Mọi thay đổi tương lai cần được đánh giá đồng thời trên 4 trục: điều hướng và quyền truy cập, rule engine và seed dataset, lưu trữ cục bộ, và tích hợp ngoài.