# HƯỚNG DẪN DÙNG AI CDSS BHYT

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục đích

Tài liệu này là bản dùng nhanh 1 trang để sử dụng bộ AI đã cấu hình cho dự án `ung_dung_cdss_bhyt` trong VS Code.

Mục tiêu:

- Giúp lập trình viên và đội nghiệp vụ gọi đúng agent/prompt cho từng tình huống.
- Giảm việc phải viết lại yêu cầu dài dòng mỗi lần làm việc.
- Giữ AI bám đúng kiến trúc đang chạy và hạn chế làm sai luồng nghiệp vụ.

## 2. Những gì đã được cấu hình

### 2.1. AI mức repo CDSS BHYT

- Workspace instructions: `.github/copilot-instructions.md`
- Custom agent: `.github/agents/cdss-bhyt.agent.md`
- Prompt nghiệp vụ: nằm trong `.github/prompts/`

AI mức repo có nhiệm vụ:

- Trả lời bằng tiếng Việt.
- Ưu tiên giữ nguyên chức năng hệ thống hiện có.
- Bám theo kiến trúc thật đang chạy qua `App.jsx` và `ma_nguon/dieu_huong/tuyen_duong.jsx`.
- Ưu tiên sửa root cause, thay đổi nhỏ, kiểm tra có mục tiêu.

### 2.2. AI mức cá nhân

- Agent cá nhân: `Tro Ly Ky Thuat Ca Nhan`
- Vị trí: hồ sơ VS Code của người dùng, không nằm trong repo Git

AI mức cá nhân phù hợp khi:

- Làm việc đa dự án.
- Cần một trợ lý kỹ thuật dùng chung cho code, tài liệu, Git, review, debug.

## 3. Cách mở và sử dụng

### 3.1. Dùng agent

Trong chat Copilot:

1. Mở cửa sổ chat trong VS Code.
2. Chọn agent ở thanh chọn agent.
3. Chọn một trong hai agent sau:
   - `CDSS BHYT Agent`: dùng riêng cho repo này.
   - `Tro Ly Ky Thuat Ca Nhan`: dùng cho nhiều repo/dự án.

### 3.2. Dùng prompt

Trong chat Copilot:

1. Gõ ký tự `/`.
2. Chọn prompt mong muốn.
3. Điền đầu vào ngắn gọn như mã hồ sơ, tên file XML, mã rule, màn hình, lỗi, hoặc mục tiêu chỉnh sửa.

Nếu chưa thấy prompt hoặc agent mới:

- Mở chat mới.
- Hoặc Reload Window trong VS Code.

## 4. Bộ prompt hiện có và cách dùng

### 4.1. Nhóm sửa lỗi và vận hành

- `Sua Loi CDSS`
  Dùng khi có lỗi màn hình, lỗi luồng nghiệp vụ, lỗi storage, lỗi điều hướng, lỗi rule engine.

- `Doc Loi Tu Anh CDSS`
  Dùng khi người dùng gửi ảnh chụp màn hình, popup, console, dashboard lỗi hoặc màn hình DocXML/Sua XML.

- `Review An Toan CDSS`
  Dùng khi cần review theo hướng tìm bug, regression, rủi ro nghiệp vụ, thiếu test.

### 4.2. Nhóm XML và hồ sơ BHYT

- `Phan Tich XML BHYT Theo Ho So`
  Dùng khi cần lần theo một hồ sơ bằng `MA_LK`, tên file XML, XML1-XML6, mã rule hoặc trường dữ liệu.

- `So Sanh Truoc Sau Sua XML`
  Dùng khi cần so sánh bản trước và sau sửa của một hồ sơ XML BHYT.

- `Bao Cao Ket Qua Sua Ho So`
  Dùng khi cần viết nhanh báo cáo kết quả sau khi sửa hồ sơ.

### 4.3. Nhóm tài liệu và quy trình

- `Cap Nhat Tai Lieu CDSS`
  Dùng khi cần cập nhật tài liệu theo đúng trạng thái mã nguồn đang chạy.

- `Chuan Bi Commit CDSS`
  Dùng khi cần rà soát thay đổi trước khi commit và đề xuất commit message.

- `Audit Rule CDSS`
  Dùng khi cần phân tích rule, hardcoded rules, seed rules, dashboard lỗi, báo cáo thống kê.

## 5. Mẫu câu dùng nhanh

### 5.1. Sửa lỗi

- `/Sua Loi CDSS Loi DocXML khi mo chi tiet ho so 000434, tren web bi QuotaExceededError`
- `/Doc Loi Tu Anh CDSS Anh chup popup loi sua XML nay dang cho thay gi?`

### 5.2. Phân tích XML

- `/Phan Tich XML BHYT Theo Ho So MA_LK 000434, tap trung XML3 va XML5, rule THUOC_417`
- `/So Sanh Truoc Sau Sua XML So sanh 2 file XML truoc va sau sua cua ho so OP26002936`

### 5.3. Rule và báo cáo

- `/Audit Rule CDSS Kiem tra vi sao rule THUOC_417 van danh sai tren ho so 000434`
- `/Bao Cao Ket Qua Sua Ho So Ho so 000434 da sua xong, viet bao cao ngan cho nghiep vu`

### 5.4. Tài liệu và Git

- `/Cap Nhat Tai Lieu CDSS Cap nhat lai mo ta phan he DocXML va Sua XML theo ma nguon hien tai`
- `/Chuan Bi Commit CDSS Kiem tra thay doi hien tai va de xuat commit message`

## 6. Nguyên tắc sử dụng an toàn

- Luôn coi mã nguồn đang chạy là nguồn sự thật ưu tiên cao hơn tài liệu cũ.
- Khi giao việc liên quan nghiệp vụ, nên nêu rõ màn hình, mã hồ sơ, mã rule, hoặc file XML cụ thể.
- Với thay đổi lớn, nên yêu cầu AI nêu rõ file bị ảnh hưởng và cách kiểm tra lại.
- Nếu làm trên luồng nhạy cảm như dashboard, DocXML, Sua XML, báo cáo, rule engine hoặc storage, nên yêu cầu AI giữ nguyên hành vi cũ nếu không có chỉ đạo đổi hành vi.

## 7. Giới hạn cần biết

- Prompt và agent trong repo chỉ có tác dụng khi làm việc trong workspace này.
- Agent cá nhân dùng được rộng hơn nhưng không tự thay thế toàn bộ hướng dẫn đặc thù của repo.
- Các file mới tạo trong repo chỉ có trên máy local cho đến khi được commit và push lên GitHub.

## 8. Khuyến nghị cho đội sử dụng

- Khi gặp lỗi thật: ưu tiên `Doc Loi Tu Anh CDSS` hoặc `Sua Loi CDSS`.
- Khi xử lý hồ sơ XML: ưu tiên `Phan Tich XML BHYT Theo Ho So`.
- Khi đã sửa xong hồ sơ: dùng `So Sanh Truoc Sau Sua XML` rồi `Bao Cao Ket Qua Sua Ho So`.
- Trước khi commit: dùng `Chuan Bi Commit CDSS`.
- Khi cần rà soát an toàn trước khi gộp code: dùng `Review An Toan CDSS`.

## 9. Kết luận

Với bộ agent và prompt hiện tại, đội có thể dùng AI theo hướng chuẩn hóa hơn cho các việc chính của CDSS BHYT:

- sửa lỗi
- phân tích XML BHYT
- audit rule
- cập nhật tài liệu
- chuẩn bị commit
- tổng hợp báo cáo sau sửa hồ sơ

Nếu sau này phát sinh tác vụ lặp lại mới, có thể bổ sung thêm prompt riêng thay vì dùng một prompt chung cho mọi việc.