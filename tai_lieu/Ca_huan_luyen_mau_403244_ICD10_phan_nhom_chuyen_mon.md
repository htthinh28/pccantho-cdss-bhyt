# CA HUẤN LUYỆN MẪU 403244 - ICD10 PHÂN NHÓM CHUYÊN MÔN TỪ BỆNH CHÍNH VÀ BỆNH KÈM

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Ca này dùng để huấn luyện AI cách giám định theo nhóm chuyên môn, dựa trên:

- `MA_BENH_CHINH`
- `MA_BENH_KT`
- đối chiếu cụm rule đang phát sinh trong audit

Trọng tâm không phải "đếm lỗi", mà là chọn đúng trục chuyên môn để phân tích và ra quyết định phù hợp.

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/xml/QD130_94170_202603_202603191032_PC-022603360.xml`
- Audit: `test_xml/audit_403244_20260405_224614.json`
- Rule nổi bật:
  - `CLN-PTTT-02`, `CLN-PTTT-05`, `CLN-PTTT-13`
  - `DVKT_0259`, `DVKT_2335`

## 3. Dữ liệu ICD10 đã xác nhận

- `MA_LK`: `403244`
- `MA_BENH_CHINH`: `K52.3`
- `MA_BENH_KT`: `K63.5`, `K21`, `E11`, `I10`, `R10.4`

## 4. Bước phân nhóm chuyên môn từ ICD10

### 4.1. Trục chuyên môn chính

- `K52.3` thuộc nhóm tiêu hóa (`K*`) -> trục chính: tiêu hóa.

### 4.2. Nhóm chuyên môn kèm theo

- `K63.5`, `K21`: tiếp tục củng cố nhóm tiêu hóa.
- `E11`: nội tiết/chuyển hóa (đái tháo đường) -> bệnh nền ảnh hưởng theo dõi điều trị.
- `I10`: tim mạch (tăng huyết áp) -> bệnh nền nguy cơ khi làm kỹ thuật có gây mê.
- `R10.4`: triệu chứng đau bụng -> hỗ trợ ngữ cảnh lâm sàng, không phải đích điều trị chính.

### 4.3. Kết luận nhóm chuyên môn của hồ sơ

- Nhóm chính: tiêu hóa.
- Nhóm nền phối hợp: nội tiết + tim mạch.
- Đây là hồ sơ đa bệnh kèm cần suy luận liên chuyên khoa, không nên xem như một ca đơn chẩn.

## 5. Liên hệ ICD10 với cụm cảnh báo thực tế

Audit của ca này chủ yếu cảnh báo ở cụm PTTT/chứng từ thực hiện:

- thiếu mã hóa `MA_PTTT_QT` ở XML1/XML3
- thiếu tóm tắt PTTT tại XML5
- thiếu/chưa đủ chứng cứ nhân sự hoặc vật tư theo seed

Điểm học quan trọng:

1. ICD10 cho biết ca thuộc trục tiêu hóa và có nền bệnh phối hợp.
2. Tuy nhiên cảnh báo hiện hữu không phải "sai ICD10", mà là "thiếu chứng cứ/mã hóa kỹ thuật".
3. AI phải tách đúng hai tầng:
   - tầng chuyên môn bệnh học (ICD10)
   - tầng chứng từ thực hiện kỹ thuật (PTTT, XML3/XML5/XML4)

## 6. Kết luận giám định mẫu theo hướng chuyên môn

1. Về chuyên môn bệnh học, hồ sơ phù hợp trục tiêu hóa có bệnh nền đi kèm.
2. Rủi ro chính trong audit nằm ở chứng từ và mã hóa kỹ thuật, không phải do ICD10 chính/kèm mâu thuẫn trực tiếp.
3. Hướng xử lý ưu tiên:
   - hoàn thiện mã `MA_PTTT_QT` tại XML1 và XML3
   - bổ sung tóm tắt thực hiện tại XML5
   - đối chiếu chứng cứ nhân sự/vật tư theo yêu cầu rule DVKT

## 7. Bài học rút ra cho AI

### 7.1. Bài học chuyên môn

- ICD10 chính + ICD10 kèm dùng để xác định trục phân tích chuyên môn trước.

### 7.2. Bài học giám định

- Không phải cảnh báo nào cũng do sai chỉ định theo ICD10; nhiều lỗi là lỗi mã hóa và chứng từ.

### 7.3. Bài học kết luận

- Kết luận phải ghi rõ lớp nguyên nhân chính:
  - sai chuyên môn (nếu có)
  - hay thiếu chứng cứ/mã hóa (như ca này)

## 8. Prompt tái sử dụng

```
Phân tích hồ sơ 403244 theo hướng ICD10 chuyên môn:
1) Tách MA_BENH_CHINH và MA_BENH_KT thành các nhóm chuyên môn.
2) Xác định nhóm chính và nhóm nền phối hợp.
3) Đối chiếu các cảnh báo audit để kết luận lỗi thuộc lớp chuyên môn hay lớp chứng từ/mã hóa.
4) Đề xuất thứ tự xử lý ưu tiên cho bệnh viện.
```
