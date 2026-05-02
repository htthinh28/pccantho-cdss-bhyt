# Hướng dẫn huấn luyện SFT cho trợ lý CDSS BHYT

Phiên bản: 1.0 · Cập nhật: 02/05/2026

## 1. Nguyên tắc

- **Huấn luyện không chạy trong app Expo**; thực hiện trên máy có **GPU NVIDIA** (hoặc Unsloth Studio / Colab) với dữ liệu **JSONL** sinh từ repo.
- **Engine giám định XML** vẫn là nguồn quyết định; mô hình chỉ **diễn giải / trợ lý**, không thay rule.

## 2. Bước 1 — Sinh dataset SFT từ dự án

Trên máy có Python 3.10+ (khuyến nghị 3.11):

```bash
cd <thư_mục_gốc_repo>
python scripts/build_sft_dataset_cdss.py
```

Mặc định đọc `tai_lieu/Danh_sach_rule_thuoc_chong_chi_dinh.csv`, ghi:

`training_data/generated/sft_chong_chi_dinh.jsonl`

Mỗi dòng:

```json
{"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
```

Tuỳ chỉnh:

```bash
python scripts/build_sft_dataset_cdss.py --input tai_lieu/Danh_sach_rule_thuoc_chong_chi_dinh.csv --out training_data/generated/ten_file.jsonl
```

Hoặc qua npm:

```bash
npm run train:build-sft-dataset
```

## 3. Bước 2 — Môi trường train

- **Python 3.10–3.12** + PyTorch bản **CUDA** khớp driver: https://pytorch.org/get-started/locally/
- Cài stack inference/ train theo Unsloth: https://github.com/unslothai/unsloth  
- **Máy không GPU:** chỉ chuẩn bị dữ liệu + dùng **Unsloth Studio / Colab** để train.

## 4. Bước 3 — Fine-tune (Unsloth Studio hoặc notebook)

1. Import file JSONL (định dạng `messages` như trên).
2. Chọn base model **Instruct** (vd. `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` hoặc 3B nếu thiếu VRAM).
3. Phương pháp: **QLoRA 4-bit**, epoch 1–3, rank 16 (điều chỉnh theo Studio).
4. Đánh giá trên tập giữ lại (split) hoặc Model Arena nếu có.

## 5. Bước 4 — Triển khai vào CDSS

- **Cách A:** Merge adapter / full weight lên Hugging Face Hub nội bộ hoặc đĩa, rồi đặt:

  `CDSS_AI_MODEL_ID=<tên_repo_hf>`

  khi chạy `npm run py:start` (máy có GPU + `requirements-ai.txt`).

- **Cách B:** Xuất **GGUF** và chạy **Ollama / llama.cpp**; khi đó cần thêm lớp proxy API trong Python (tách khỏi pipeline hiện tại nếu không dùng transformers).

- **Thử không GPU:** `CDSS_AI_MOCK=1` chỉ để kiểm thử UI, không phải mô hình thật.

## 6. Bổ sung dữ liệu chất lượng

- Gộp thêm cặp hỏi–đáp từ `tai_lieu/` (chunk + câu hỏi chỉ dựa trên đoạn), audit thực tế (đã ẩn danh), và **mẫu từ chối** (“không đủ thông tin”) — nên append vào cùng JSONL hoặc file riêng rồi trộn khi train.

## 7. Kiểm thử sau train

- So sánh trả lời với **cảnh báo engine** trên vài MA_LK mẫu; không dùng LLM để **quyết định thanh toán**.

---

Sau khi sửa file này trong `tai_lieu/`, chạy `npm run tai_lieu:prepare` để đồng bộ Thư viện trong app.
