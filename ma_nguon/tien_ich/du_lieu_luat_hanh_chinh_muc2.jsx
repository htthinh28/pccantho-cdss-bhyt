/** AUTO-GENERATED from DuLieu_LUAT_HANH_CHINH (7).xlsx + HC_249; HC_13…HC_205 mức hưởng theo QĐ 1018/QĐ-BHXH (ký tự thứ 3 thẻ) + HC_251 (CV 38) + HC_302 (CV 302/CSYT-CĐ, LCS 2.530.000 từ 01/7/2026) */
export const PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2 = '2026-06-11_cv302_lcs_2530000';
export const COT_SEED_LUAT_HANH_CHINH_MUC2 = ["TRANG_THAI","MA_LUAT","TEN_QUY_TAC","DIEU_KIEN","CANH_BAO","NGUON_DU_LIEU"];
export const DU_LIEU_SEED_LUAT_HANH_CHINH_MUC2 = [
  {
    "id": "SEED_HANHCHINH_1",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_01",
    "TEN_QUY_TAC": "Ưu tiên mã R (Triệu chứng)",
    "DIEU_KIEN": "COUNT(XML2) == 0 AND XML1.MA_BENH_CHINH STARTS_WITH ('Z')",
    "CANH_BAO": "TỐI ƯU: Thay vì dùng mã Z, hãy dùng mã chương R (Triệu chứng) để giải trình tính cấp thiết của XN/CĐHA.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_2",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_02",
    "TEN_QUY_TAC": "Chỉ định XN/CĐHA theo mã Z",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH STARTS_WITH ('Z') AND COUNT(XML3) > 0 AND XML1.T_BHTT > 0",
    "CANH_BAO": "LỖI: Mã Z (Kiểm tra) không kèm thuốc điều trị thường bị coi là Khám sức khỏe/Tầm soát. BHYT sẽ từ chối thanh toán.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_3",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_03",
    "TEN_QUY_TAC": "Kiểm soát đơn thuốc trống",
    "DIEU_KIEN": "COUNT(XML2) == 0 AND COUNT(XML3) > 0 AND XML1.MA_LOAI_KCB == '1'",
    "CANH_BAO": "CẢNH BÁO: Lượt khám ngoại trú có DVKT nhưng không có thuốc. Vui lòng xác nhận lý do: Tư vấn/Theo dõi/Chờ KQ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_4",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_04",
    "TEN_QUY_TAC": "Bắt buộc ghi chú lâm sàng",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "YÊU CẦU: Chỉ định cận lâm sàng giá trị cao nhưng không kê đơn. Bác sĩ phải nhập diễn giải lâm sàng tại trường MO_TA_BENH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: COUNT(XML2) == 0 AND SUM(XML3.THANH_TIEN_BH) > 50000"
  },
  {
    "id": "SEED_HANHCHINH_5",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_05",
    "TEN_QUY_TAC": "Khám thai định kỳ (SOP)",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH == 'Z34' AND XML3.MA_DICH_VU IN ('SIEU_AM', 'XN_MAU') AND COUNT(XML2) == 0",
    "CANH_BAO": "GỢI Ý: Khám thai định kỳ không thuốc là hợp lệ. Đảm bảo ghi chú \"Khám thai định kỳ lần thứ...\" vào trường GHI_CHU.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_6",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_06",
    "TEN_QUY_TAC": "Chi phí thấp (Dưới 15% LCS)",
    "DIEU_KIEN": "((SUBSTR(XML1.NGAY_VAO, 1, 8) < '20260701' AND XML1.T_TONGCHI_BH < (0.15 * 2340000)) OR (SUBSTR(XML1.NGAY_VAO, 1, 8) >= '20260701' AND XML1.T_TONGCHI_BH < (0.15 * 2530000))) AND XML1.T_BNCCT > 0 AND XML1.MA_LOAI_KCB NOT IN ('1', '01')",
    "CANH_BAO": "⛔ [THU SAI]: Chi phí đợt điều trị dưới ngưỡng 15% LCS (351.000đ trước 01/7/2026; 379.500đ từ 01/7/2026), BN phải được hưởng 100%. Cơ sở không được thu tiền cùng chi trả.",
    "GHI_CHU": "CV 302/CSYT-CĐ + NĐ 161/2026. Không áp MA_LOAI_KCB 1/01 (khám/ngoại trú).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_7",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_07",
    "TEN_QUY_TAC": "KCB tại Tuyến cơ sở (Cấp ban đầu)",
    "DIEU_KIEN": "CSKCB.CAP_CHUYEN_MON == 'BAN_DAU' AND (XML1.T_BHTT < XML1.T_TONGCHI_BH OR XML1.T_BNCCT > 0)",
    "CANH_BAO": "⛔ [VI PHẠM Đ22]: KCB tại Tuyến cơ sở/Cấp ban đầu (Trạm y tế, YT cơ quan...) được hưởng 100%. Yêu cầu hoàn trả tiền cùng chi trả cho BN.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_8",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_08",
    "TEN_QUY_TAC": "Ngoại trú tại Phòng khám ĐKKV",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND CSKCB.HINH_THUC_TC == 'PK_DA_KHOA_KV' AND (XML1.T_BHTT < XML1.T_TONGCHI_BH OR XML1.T_BNCCT > 0)",
    "CANH_BAO": "⛔ [VI PHẠM Đ22]: 100% chi phí KCB ngoại trú tại Phòng khám đa khoa khu vực theo Luật 2024. Không được thu phí cùng chi trả.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_9",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_09",
    "TEN_QUY_TAC": "Miễn cùng chi trả (5 năm LT)",
    "DIEU_KIEN": "XML1.MA_DK_BD == '1' AND ((SUBSTR(XML1.NGAY_VAO, 1, 8) < '20260701' AND XML1.T_BNCCT_LUY_KE > (6 * 2340000)) OR (SUBSTR(XML1.NGAY_VAO, 1, 8) >= '20260701' AND XML1.T_BNCCT_LUY_KE > (6 * 2530000))) AND (XML1.T_BHTT < XML1.T_TONGCHI_BH OR XML1.T_BNCCT > 0)",
    "CANH_BAO": "⛔ [QUYỀN LỢI 5 NĂM]: BN đã đủ điều kiện miễn cùng chi trả (lũy kế > 14.040.000đ trước 01/7/2026; > 15.180.000đ từ 01/7/2026). Cơ sở thu tiền cùng chi trả là sai quy định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_10",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_10",
    "TEN_QUY_TAC": "Cấp cứu (Bất kỳ cơ sở nào)",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '2' AND XML1.T_BNCCT > 0",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Tình trạng cấp cứu được hưởng quyền lợi như đúng tuyến (100% với một số đối tượng). Rà soát lý do thu tiền cùng chi trả của BN.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_11",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_11",
    "TEN_QUY_TAC": "Quân - Dân y kết hợp",
    "DIEU_KIEN": "CSKCB.LOAI_HINH == 'QUAN_DAN_Y' AND (XML1.T_BHTT < XML1.T_TONGCHI_BH OR XML1.T_BNCCT > 0)",
    "CANH_BAO": "⛔ [VI PHẠM]: Trạm y tế/Phòng khám quân dân y thuộc cấp ban đầu, BN được hưởng 100% chi phí KCB.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_12",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_12",
    "TEN_QUY_TAC": "Sai mức hưởng trẻ sơ sinh",
    "DIEU_KIEN": "DIFF_DAYS(XML1.NGAY_SINH, TODAY) < 60 AND (XML1.T_BHTT < XML1.T_TONGCHI_BH OR XML1.T_BNCCT > 0)",
    "CANH_BAO": "⛔ [TRẺ EM]: Trẻ dưới 60 ngày tuổi (chưa có thẻ/dùng thẻ tạm) mặc định hưởng 100%. Không được thu phí.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_13",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_13",
    "TEN_QUY_TAC": "Trẻ em dưới 6 tuổi (TE)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'TE' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [MỨC HƯỞNG]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 trên thẻ (nhóm TE/CC: mức 1 → 100% phạm vi chi trả; có giới hạn thuốc/VKT/DVKT theo BYT). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_14",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_14",
    "TEN_QUY_TAC": "Công nhân cao su (NĐ 188)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'CS' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 4 / CS]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 4 → 80% chi phí KCB thuộc phạm vi (có giới hạn thuốc/VKT/DVKT). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_15",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_15",
    "TEN_QUY_TAC": "Dân cư xã An toàn khu (NĐ 188)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'AK' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 2 / AK]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 2 → 100% phạm vi chi trả (có giới hạn thuốc/VKT/DVKT). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_16",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_16",
    "TEN_QUY_TAC": "Ngoại trú trái tuyến (Cấp tỉnh)",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND XML1.MA_LYDO_VVIEN == '3' AND CSKCB.HANG_BV == '1' AND XML1.T_BHTT > 0",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: BHYT không thanh toán KCB ngoại trú trái tuyến tại bệnh viện tuyến Tỉnh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_17",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_17",
    "TEN_QUY_TAC": "Nội trú trái tuyến (Cấp tỉnh)",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND XML1.MA_LYDO_VVIEN == '3' AND CSKCB.HANG_BV == '1' AND XML1.T_BHTT < XML1.T_TONGCHI_BH",
    "CANH_BAO": "⚠️ [THÔNG TUYẾN]: Nội trú trái tuyến tỉnh được hưởng 100% mức hưởng theo quy định thông tuyến tỉnh từ 2021.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_18",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_18",
    "TEN_QUY_TAC": "Chuyển tuyến không hợp lệ",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '3' AND IS_EMPTY(XML1.MA_NOI_CHUYEN)",
    "CANH_BAO": "⛔ [HÀNH CHÍNH]: Hồ sơ ghi nhận Đúng tuyến nhưng thiếu thông tin Mã nơi chuyển (Bảng 1).",
    "GHI_CHU_SUA": "2026-04-13: Bật ON — điều kiện thuần XML1 (MA_LYDO_VVIEN, MA_NOI_CHUYEN); đối chiếu mã lý do vào viện theo QĐ 130.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_19",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_19",
    "TEN_QUY_TAC": "Vận chuyển người bệnh (NĐ 188)",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM == '15') > 0 AND NOT (XML1.MA_THE_BHYT STARTS_WITH 'DT' OR XML1.MA_THE_BHYT STARTS_WITH 'DK' OR XML1.MA_THE_BHYT STARTS_WITH 'HT' OR XML1.MA_THE_BHYT STARTS_WITH 'HN' OR XML1.MA_THE_BHYT STARTS_WITH 'BT')",
    "CANH_BAO": "⛔ [PHẠM VI]: Chỉ các đối tượng ưu tiên (DT, HN, BT...) mới được quỹ BHYT thanh toán chi phí vận chuyển.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_20",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_20",
    "TEN_QUY_TAC": "Nghệ nhân ưu tú (NĐ 188)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'NN' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 4 / NN]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 4 → 80% phạm vi chi trả. T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_21",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_21",
    "TEN_QUY_TAC": "Trẻ sơ sinh chưa có thẻ",
    "DIEU_KIEN": "IS_EMPTY(XML1.MA_THE_BHYT) AND LEN(XML1.MA_THE_TAM) == 0 AND DIFF_DAYS(XML1.NGAY_SINH, TODAY) < 60",
    "CANH_BAO": "⚠️ [NHẮC NHỞ]: Trẻ dưới 60 ngày tuổi chưa có thẻ BHYT bắt buộc phải có Mã thẻ tạm để hưởng quyền lợi TE.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_22",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_22",
    "TEN_QUY_TAC": "Thẻ hết hạn khi đang điều trị",
    "DIEU_KIEN": "XML1.NGAY_RA > XML1.GT_THE_DEN AND XML1.MA_LOAI_KCB == '3' AND DIFF_DAYS(XML1.GT_THE_DEN, XML1.NGAY_RA) > 15",
    "CANH_BAO": "⛔ [THỜI HẠN]: Quỹ BHYT chỉ thanh toán tối đa 15 ngày kể từ ngày thẻ hết hạn khi đang điều trị nội trú.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_23",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_23",
    "TEN_QUY_TAC": "Nhóm Quân nhân/Công an (QN, CA, CY)",
    "DIEU_KIEN": "(XML1.MA_THE_BHYT STARTS_WITH 'QN' OR XML1.MA_THE_BHYT STARTS_WITH 'CA' OR XML1.MA_THE_BHYT STARTS_WITH 'CY') AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 5 / QN, CA, CY]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 5 → 100% chi phí KCB trong phạm vi chi trả (và quy định mở rộng theo đối tượng). Kiểm tra T_BHTT so với T_TONGCHI_BH (trả thiếu phần phạm vi).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_24",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_24",
    "TEN_QUY_TAC": "Nhóm Hộ nghèo/Dân tộc (HN, DT)",
    "DIEU_KIEN": "(XML1.MA_THE_BHYT STARTS_WITH 'HN' OR XML1.MA_THE_BHYT STARTS_WITH 'DT') AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 2 / HN, DT]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 2 → 100% phạm vi chi trả (có giới hạn thuốc/VKT/DVKT). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_25",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_25",
    "TEN_QUY_TAC": "Thẻ CN (hộ cận nghèo) — mức 100% phạm vi (CV 38/BYT-BH; NQ 261/2025)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'CN' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [MỨC HƯỞNG]: Từ 01/01/2026 theo NQ 261/2025/QH15 và Công văn 38/BYT-BH (06/01/2026), người thuộc hộ cận nghèo (thẻ CN) được hưởng 100% phạm vi chi trả BHYT (không còn 95%); engine đối chiếu T_BHTT/T_TONGCHI_BH theo mã quyền lợi đã quy đổi (ký tự thứ 3 trên XML 3 → 2 kể từ mốc trên). Trước 01/01/2026 vẫn theo QĐ 1018 — mức 3 → 95%. Hiện T_BHTT chưa khớp tỷ lệ kỳ vọng so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_26",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_26",
    "TEN_QUY_TAC": "Chuyển tuyến cấp cứu (NĐ 188)",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '2' AND DIFF_DAYS(XML1.NGAY_VAO, XML1.NGAY_RA) > 3",
    "CANH_BAO": "⚠️ [GIÁM SÁT]: Tình trạng cấp cứu nhưng nằm viện trên 3 ngày cần rà soát lại tiêu chuẩn bệnh nặng hay ổn định để chuyển Đúng tuyến.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_27",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_27",
    "TEN_QUY_TAC": "Tỷ lệ thanh toán VTYT thay thế",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [NĐ 188/2025]: Một đơn vị VTYT thay thế không vượt quá 40 tháng lương cơ sở (40 * 2.340.000 = 93.600.000đ).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_28",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_28",
    "TEN_QUY_TAC": "Tỷ lệ thanh toán Thuốc 50%",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.386' AND XML2.TYLE_TT != 50",
    "CANH_BAO": "⛔ [VBHN 15]: Hoạt chất Oxaliplatin chỉ được thanh toán 50% tỷ lệ cho một số chỉ định nhất định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_29",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_29",
    "TEN_QUY_TAC": "VTYT Thủy tinh thể nhân tạo",
    "DIEU_KIEN": "XML4.MA_VAT_TU == 'TTT_NHAN_TAO' AND XML4.THANH_TIEN_BH > 3000000",
    "CANH_BAO": "⛔ [QĐ 1395]: Thanh toán theo giá thực tế mua sắm nhưng không vượt quá 3.000.000đ/cái (Vật tư tỷ lệ).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_30",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_30",
    "TEN_QUY_TAC": "Tỷ lệ VTYT Máy tạo nhịp tim",
    "DIEU_KIEN": "XML4.MA_VAT_TU == 'MAY_TAO_NHIP' AND XML4.TYLE_TT != 100",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Máy tạo nhịp tim thường được hưởng 100% nhưng phải trong giới hạn giá trần quy định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_31",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_31",
    "TEN_QUY_TAC": "Họ tên chứa ký tự đặc biệt",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hành chính: Họ tên chứa số hoặc ký tự lạ (Vd: @, #, 123).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_32",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_32",
    "TEN_QUY_TAC": "Họ tên quá ngắn",
    "DIEU_KIEN": "LEN(XML1.HO_TEN) < 5",
    "CANH_BAO": "⚠️ Kiểm tra: Họ tên người bệnh quá ngắn, nghi ngờ dữ liệu ảo hoặc chưa đầy đủ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_33",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_33",
    "TEN_QUY_TAC": "Sai cấu trúc mã thẻ BHYT",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã thẻ BHYT không đúng cấu trúc (2 chữ - 13 số).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_34",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_34",
    "TEN_QUY_TAC": "Ngày sinh lớn hơn ngày hiện tại",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi logic: Ngày sinh của người bệnh nằm ở tương lai.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_35",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_35",
    "TEN_QUY_TAC": "Trẻ em TE nhưng tuổi > 6",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Sai đối tượng: Thẻ TE nhưng người bệnh đã từ 6 tuổi trở lên.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: XML1.MA_THE_BHYT STARTS_WITH 'TE' AND (FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) >= 6)"
  },
  {
    "id": "SEED_HANHCHINH_36",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_36",
    "TEN_QUY_TAC": "Thẻ HS/SV nhưng tuổi > 28",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Đối tượng Học sinh/Sinh viên nhưng tuổi đời quá cao, cần kiểm tra lại thẻ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: (XML1.MA_THE_BHYT STARTS_WITH 'HS' OR XML1.MA_THE_BHYT STARTS_WITH 'SV') AND (FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) > 28)"
  },
  {
    "id": "SEED_HANHCHINH_37",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_37",
    "TEN_QUY_TAC": "Địa chỉ thiếu thông tin xã/huyện",
    "DIEU_KIEN": "XML1.DIA_CHI NOT LIKE '%,%'",
    "CANH_BAO": "⚠️ Lỗi hồ sơ: Địa chỉ phải có ít nhất dấu phẩy ngăn cách xã/huyện/tỉnh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_38",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_38",
    "TEN_QUY_TAC": "Mã tỉnh trong địa chỉ sai",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi danh mục: Mã tỉnh/thành phố không có trong danh mục hành chính quốc gia.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_TINH, chưa thấy được nạp vào context engine hiện tại. Điều kiện gốc: SUBSTR(XML1.MATINH_CU_TRU, 0, 2) NOT IN (DM_TINH)"
  },
  {
    "id": "SEED_HANHCHINH_39",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_39",
    "TEN_QUY_TAC": "Giới tính mâu thuẫn với tên",
    "DIEU_KIEN": "XML1.HO_TEN LIKE '%VĂN%' AND XML1.GIOI_TINH == '2' AND NOT NGOAI_TRU_HC39_HC40_TRE_SO_SINH(XML1)",
    "CANH_BAO": "⚠️ Kiểm tra: Họ tên có chữ \"Văn\" nhưng khai báo giới tính Nữ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ Ngoại trừ trẻ <15 ngày: tên theo mẹ (CB / Con bà đầu chuỗi) — NGOAI_TRU_HC39_HC40_TRE_SO_SINH trong dong_co_giam_dinh.jsx"
  },
  {
    "id": "SEED_HANHCHINH_40",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_40",
    "TEN_QUY_TAC": "Giới tính mâu thuẫn với tên (Nữ)",
    "DIEU_KIEN": "XML1.HO_TEN LIKE '%THỊ%' AND XML1.GIOI_TINH == '1' AND NOT NGOAI_TRU_HC39_HC40_TRE_SO_SINH(XML1)",
    "CANH_BAO": "⚠️ Kiểm tra: Họ tên có chữ \"Thị\" nhưng khai báo giới tính Nam.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ Ngoại trừ trẻ <15 ngày: tên theo mẹ (CB / Con bà đầu chuỗi) — NGOAI_TRU_HC39_HC40_TRE_SO_SINH trong dong_co_giam_dinh.jsx"
  },
  {
    "id": "SEED_HANHCHINH_41",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_41",
    "TEN_QUY_TAC": "Thẻ CC/CK sai mức hưởng",
    "DIEU_KIEN": "(XML1.MA_THE_BHYT STARTS_WITH 'CC' OR XML1.MA_THE_BHYT STARTS_WITH 'CK') AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 1 / CC; mức 2 / CK]: Theo QĐ 1018/QĐ-BHXH — CC→mức 1 (100%, không giới hạn tỷ lệ TT thuốc/VKT/DVKT); CK→mức 2 (100% có giới hạn). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_42",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_42",
    "TEN_QUY_TAC": "Mã nơi ĐK KCB ban đầu sai định dạng",
    "DIEU_KIEN": "LEN(XML1.MA_DKBD) != 5",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Mã cơ sở đăng ký ban đầu phải có đủ 5 chữ số.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_43",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_43",
    "TEN_QUY_TAC": "Giờ ra viện trước giờ vào viện",
    "DIEU_KIEN": "XML1.NGAY_RA < XML1.NGAY_VAO",
    "CANH_BAO": "⛔ Lỗi logic: Thời gian ra viện không thể trước thời gian vào viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_44",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_44",
    "TEN_QUY_TAC": "Giờ vào khoa trước giờ tiếp đón",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi quy trình: Bệnh nhân vào khoa điều trị trước khi làm thủ tục tiếp đón.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.NGAY_VAO_KHOA < HIS.NGAY_TIEP_DON"
  },
  {
    "id": "SEED_HANHCHINH_45",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_45",
    "TEN_QUY_TAC": "Y lệnh sau khi bệnh nhân đã ra viện",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Sai y lệnh: Tồn tại thuốc/dịch vụ chỉ định sau thời điểm thanh toán ra viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_46",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_46",
    "TEN_QUY_TAC": "Thời gian nằm viện nội trú = 0",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND XML1.SO_NGAY_DTRI == 0",
    "CANH_BAO": "⛔ Lỗi logic: Điều trị nội trú tối thiểu phải tính là 1 ngày (hoặc 4h theo quy định mới).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_47",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_47",
    "TEN_QUY_TAC": "Khám ngoại trú quá 24h",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND DATEDIFF_HOUR(XML1.NGAY_VAO, XML1.NGAY_RA) > 24",
    "CANH_BAO": "⚠️ Kiểm tra: Lượt khám ngoại trú kéo dài quá 24h, cần chuyển sang diện nội trú hoặc lưu theo dõi.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_48",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_48",
    "TEN_QUY_TAC": "Mã khoa phòng không đúng chuẩn",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hệ thống: Mã khoa phòng chưa được ánh xạ (map) đúng với danh mục 9324 của Bộ Y tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_KHOA_BYT, chưa thấy được nạp vào context engine hiện tại. Điều kiện gốc: XML1.MA_KHOA NOT IN (DM_KHOA_BYT)"
  },
  {
    "id": "SEED_HANHCHINH_49",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_49",
    "TEN_QUY_TAC": "Mã bệnh chính không phải ICD-10",
    "DIEU_KIEN": "LEN(XML1.MA_BENH_CHINH) < 3 OR XML1.MA_BENH_CHINH NOT IN (DM_ICD10)",
    "CANH_BAO": "⛔ Lỗi danh mục: Mã bệnh chính không có trong từ điển ICD-10 quốc tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_50",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_50",
    "TEN_QUY_TAC": "Mã tai nạn thương tích sai",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '4' AND XML1.MA_TAI_NAN NOT IN (1,2,3,4,5)",
    "CANH_BAO": "⛔ Lỗi mã hóa: Mã tai nạn giao thông (MA_TNGT) chỉ nhận giá trị từ 1 đến 5.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_51",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_51",
    "TEN_QUY_TAC": "Đơn vị tính thuốc không chuẩn",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Đơn vị tính thuốc (DVT) không khớp với danh mục dùng chung của BHXH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_DVT_BYT, chưa thấy được nạp vào context engine hiện tại; cú pháp COUNT_IF cũng chưa theo lambda an toàn. Điều kiện gốc: COUNT_IF(XML2, DON_VI_TINH NOT IN (DM_DVT_BYT))"
  },
  {
    "id": "SEED_HANHCHINH_52",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_52",
    "TEN_QUY_TAC": "Mã quốc gia vật tư sai",
    "DIEU_KIEN": "COUNT_IF(XML3, LEN(NUOC_SX) != 2)",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã nước sản xuất (VTYT) phải dùng mã 2 ký tự (Vd: VN, US, JP).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_53",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_53",
    "TEN_QUY_TAC": "Chuyển tuyến thiếu số hồ sơ chuyển",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '3' AND IS_EMPTY(XML1.SO_GIAY_CHUYEN_TUYEN)",
    "CANH_BAO": "⚠️ Thiếu chứng từ: Bệnh nhân chuyển tuyến đến nhưng không nhập số giấy chuyển tuyến.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_54",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_54",
    "TEN_QUY_TAC": "Tuyến cơ sở KCB ban đầu sai",
    "DIEU_KIEN": "XML1.MA_THE_TAM == 1 AND XML1.MA_DKBD != XML1.MA_CSKCB",
    "CANH_BAO": "⚠️ Kiểm tra: Đánh dấu đúng tuyến (Mã thẻ tạm = 1) nhưng nơi ĐK ban đầu không phải là đơn vị này.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_55",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_55",
    "TEN_QUY_TAC": "Cấp cứu nhưng mã lý do vào viện sai",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Mâu thuẫn: Hình thức đến là cấp cứu nhưng lý do vào viện không phải là 2.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.HINH_THUC_DEN == 'CAP_CUU' AND XML1.MA_LYDO_VVIEN != '2'"
  },
  {
    "id": "SEED_HANHCHINH_56",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_56",
    "TEN_QUY_TAC": "Ngày cấp GCT sau ngày vào viện",
    "DIEU_KIEN": "XML1.NGAY_GIAY_CHUYEN_TUYEN > XML1.NGAY_VAO",
    "CANH_BAO": "⛔ Lỗi logic: Giấy chuyển tuyến được cấp sau ngày bệnh nhân đã nhập viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_57",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_57",
    "TEN_QUY_TAC": "Mã cơ sở chuyển đi không tồn tại",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Mã bệnh viện nơi chuyển đi không có trong danh mục toàn quốc.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_BENH_VIEN, chưa thấy được nạp vào context engine hiện tại. Điều kiện gốc: XML1.MA_NOI_DI != '' AND XML1.MA_NOI_DI NOT IN (DM_BENH_VIEN)"
  },
  {
    "id": "SEED_HANHCHINH_58",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_58",
    "TEN_QUY_TAC": "Tiền BHYT trả lớn hơn Tổng chi phí",
    "DIEU_KIEN": "XML1.T_BHTT > XML1.T_TONGCHI_BH",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Tiền bảo hiểm thanh toán lớn hơn tổng chi phí hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_59",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_59",
    "TEN_QUY_TAC": "Tổng tiền thuốc lẻ (Decimal)",
    "DIEU_KIEN": "COUNT_IF(XML2, THANH_TIEN != ROUND(THANH_TIEN, 2))",
    "CANH_BAO": "⛔ Lỗi làm tròn: Thành tiền thuốc vượt quá 2 chữ số thập phân (Sai cấu trúc XML).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_60",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_60",
    "TEN_QUY_TAC": "Tiền bệnh nhân trả âm",
    "DIEU_KIEN": "XML1.T_BNCCT < 0",
    "CANH_BAO": "⛔ Lỗi tài chính: Tiền bệnh nhân cùng chi trả bị âm (vô lý).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_61",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_61",
    "TEN_QUY_TAC": "Sai lệch tổng tiền XML1 và XML3",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi đồng bộ: Tổng tiền vật tư tại XML1 không khớp với chi tiết XML3.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_VTYT - SUM(XML3.THANH_TIEN WHERE MA_NHOM==10)) > 1"
  },
  {
    "id": "SEED_HANHCHINH_62",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_62",
    "TEN_QUY_TAC": "Bác sĩ điều trị thiếu mã CCHN",
    "DIEU_KIEN": "IS_EMPTY(XML1.MA_TTDV)",
    "CANH_BAO": "⛔ Thiếu pháp lý: Hồ sơ tổng kết bắt buộc phải có mã Chứng chỉ hành nghề của BS điều trị.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_63",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_63",
    "TEN_QUY_TAC": "Mã CCHN bác sĩ sai định dạng",
    "DIEU_KIEN": "NOT REGEX_MATCH(XML1.MA_TTDV, '^[0-9]+/[A-Z]+-[A-Z]+$')",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Mã CCHN bác sĩ quá ngắn hoặc sai định dạng quy định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_64",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_64",
    "TEN_QUY_TAC": "Bác sĩ mổ trùng bác sĩ gây mê",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Một người vừa đứng tên phẫu thuật viên vừa đứng tên bác sĩ gây mê.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_65",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_65",
    "TEN_QUY_TAC": "Mốc chỉ định/thực hiện/kết quả DV ngoài khoảng vào–ra viện",
    "DIEU_KIEN": "HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA(XML1, XML2, XML3, XML4)",
    "CANH_BAO": "⛔ Lỗi logic: Có mốc thời gian (chỉ định NGAY_YL, thực hiện NGAY_TH_YL, kết quả NGAY_KQ trên XML3/XML4; thuốc NGAY_YL trên XML2) nằm trước thời điểm vào viện hoặc sau thời điểm ra viện — so sánh sau khi parse định dạng YYYYMMDDHHmm. (Không dùng NGAY_TTOAN so với NGAY_RA; thanh toán có thể trước giờ ra viện.)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ Đổi từ NGAY_TTOAN < NGAY_RA sang HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA: parse ngày giờ rồi kiểm tra mốc DV trong [NGAY_VAO, NGAY_RA]."
  },
  {
    "id": "SEED_HANHCHINH_66",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_66",
    "TEN_QUY_TAC": "Sai phiên bản XML 130",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Từ chối: Phiên bản cấu trúc XML không phải 2.0 theo QĐ 130.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.VERSION != '2.0'"
  },
  {
    "id": "SEED_HANHCHINH_67",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_67",
    "TEN_QUY_TAC": "Mã cơ sở KCB trong file sai",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hệ thống: Mã bệnh viện trong tệp XML không khớp với mã của Phương Châu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.MA_CSKCB != '95013'"
  },
  {
    "id": "SEED_HANHCHINH_68",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_68",
    "TEN_QUY_TAC": "Thiếu tệp chi tiết XML2",
    "DIEU_KIEN": "COUNT(XML2) == 0 AND XML1.T_THUOC > 0",
    "CANH_BAO": "⛔ Thiếu dữ liệu: XML1 báo có tiền thuốc nhưng không có tệp XML2 đính kèm.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_69",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_69",
    "TEN_QUY_TAC": "Thiếu tệp chi tiết XML3",
    "DIEU_KIEN": "COUNT(XML3) == 0 AND XML1.T_VTYT > 0",
    "CANH_BAO": "⛔ Thiếu dữ liệu: XML1 báo có tiền vật tư nhưng không có tệp XML3 đính kèm.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_70",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_70",
    "TEN_QUY_TAC": "Thừa tệp tin không quy định",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Gói dữ liệu chứa tệp tin lạ không nằm trong quy định của Bộ Y tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc metadata file/header không có trong payload XML nghiệp vụ. Điều kiện gốc: FILE_NAME NOT IN (XML1...XML12)"
  },
  {
    "id": "SEED_HANHCHINH_71",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_71",
    "TEN_QUY_TAC": "Thiếu số điện thoại liên lạc",
    "DIEU_KIEN": "IS_EMPTY(XML1.DIEN_THOAI)",
    "CANH_BAO": "⚠️ JCI Audit: Bệnh nhân thiếu số điện thoại để liên lạc sau xuất viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_72",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_72",
    "TEN_QUY_TAC": "Chẩn đoán ICD-10 tiếng Việt không dấu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Tên bệnh không có dấu tiếng Việt, yêu cầu chuẩn hóa hiển thị.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_73",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_73",
    "TEN_QUY_TAC": "Bệnh nhân quốc tịch nước ngoài thiếu hộ chiếu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Pháp lý: Bệnh nhân người nước ngoài nên khai báo số Hộ chiếu (Passport).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_QUOCTICH NOT IN ('704', 'VN', 'VNM')AND IS_EMPTY(EXT.SO_HO_CHIEU)"
  },
  {
    "id": "SEED_HANHCHINH_74",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_74",
    "TEN_QUY_TAC": "Khoa phòng thực hiện mâu thuẫn",
    "DIEU_KIEN": "XML3.MA_KHOA == 'K_NOI' AND XML3.MA_NHOM == '04'",
    "CANH_BAO": "⚠️ Kiểm tra: Dịch vụ Phẫu thuật nhưng nơi thực hiện lại khai báo tại khoa Nội.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_75",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_75",
    "TEN_QUY_TAC": "Gửi hồ sơ chậm quá 7 ngày",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Hồ sơ ra viện quá 7 ngày chưa đẩy cổng, vi phạm thời gian quy định của BHXH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_76",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_76",
    "TEN_QUY_TAC": "Định danh CCCD sai cấu trúc",
    "DIEU_KIEN": "LEN(XML1.SO_CCCD) != 12 AND XML1.SO_CCCD != ''",
    "CANH_BAO": "⛔ Lỗi hành chính: Số CCCD/Mã định danh phải có đúng 12 chữ số.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_77",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_77",
    "TEN_QUY_TAC": "Trẻ em thiếu số định danh cá nhân",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo Đề án 06: Trẻ em chưa có mã định danh cá nhân, cần cập nhật từ Giấy khai sinh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: (FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) < 6)AND IS_EMPTY(XML1.SO_CCCD)"
  },
  {
    "id": "SEED_HANHCHINH_78",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_78",
    "TEN_QUY_TAC": "Thiếu số định danh khi dùng VNeID",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hồ sơ: Sử dụng xác thực qua VNeID nhưng không truyền số CCCD vào file XML.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: EXT.HINH_THUC_THE == 'VNEID' AND IS_EMPTY(XML1.SO_CCCD)"
  },
  {
    "id": "SEED_HANHCHINH_79",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_79",
    "TEN_QUY_TAC": "Mã dân tộc sai chuẩn",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi danh mục: Mã dân tộc phải theo chuẩn 54 dân tộc của Tổng cục Thống kê.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_DAN_TOC_BYT, chưa thấy được nạp vào context engine hiện tại. Điều kiện gốc: XML1.MA_DANTOC NOT IN (DM_DAN_TOC_BYT)"
  },
  {
    "id": "SEED_HANHCHINH_80",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_80",
    "TEN_QUY_TAC": "Thẻ BHYT có ký tự '0' ở đầu",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH '0'",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã thẻ BHYT không được bắt đầu bằng số 0 (phải là 2 chữ cái).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_81",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_81",
    "TEN_QUY_TAC": "Thẻ mã vùng K1/K2/K3 thiếu nơi sống",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Hưởng quyền lợi khu vực ưu tiên nhưng thiếu mã nơi sinh sống đặc thù.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_KV != '' AND IS_EMPTY(EXT.MA_NOI_SINH_SONG)"
  },
  {
    "id": "SEED_HANHCHINH_82",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_82",
    "TEN_QUY_TAC": "Thẻ Cựu chiến binh (CB) sai mức hưởng",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'CB' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 2 / CB]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 2 → 100% phạm vi chi trả (có giới hạn thuốc/VKT/DVKT). T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_83",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_83",
    "TEN_QUY_TAC": "Thẻ mã 'TS' (Thân nhân liệt sĩ)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'TS' AND VI_PHAM_TS_TYLE_BHTT_DUOI_95(XML1)",
    "CANH_BAO": "⛔ [Mức 2 / TS]: Tỷ lệ T_BHTT so với T_TONGCHI_BH dưới 95%. Coi là đúng nếu tỷ lệ ≥ 95% (không bắt khớp 100% từng đồng theo ký hiệu số thứ 3 thẻ).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_84",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_84",
    "TEN_QUY_TAC": "Thẻ BHYT hết hạn tại thời điểm y lệnh",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Xuất toán: Thuốc/Dịch vụ được chỉ định sau ngày thẻ BHYT hết giá trị sử dụng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_85",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_85",
    "TEN_QUY_TAC": "Giấy chuyển tuyến thiếu mã nơi đi",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '3' AND LEN(XML1.MA_NOI_DI) != 5",
    "CANH_BAO": "⛔ Lỗi cấu trúc: Mã bệnh viện nơi chuyển đi phải đúng 5 chữ số định danh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_86",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_86",
    "TEN_QUY_TAC": "Giấy hẹn khám lại quá thời hạn",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_TAI_KHAM) AND DATEDIFF_DAY(XML1.NGAY_TAI_KHAM, XML1.NGAY_VAO) > 10",
    "CANH_BAO": "⚠️ Cảnh báo: Bệnh nhân đến khám muộn quá 10 ngày so với lịch hẹn tái khám.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_87",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_87",
    "TEN_QUY_TAC": "Chuyển tuyến không đúng thẩm quyền",
    "DIEU_KIEN": "XML1.CAP_NOI_DI > XML1.CAP_NOI_DEN",
    "CANH_BAO": "⚠️ Logic: Tuyến trên chuyển về tuyến dưới diện \"Chuyển tuyến\" cần kiểm tra lý do.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_88",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_88",
    "TEN_QUY_TAC": "Thiếu mã số hồ sơ chuyển tuyến",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '3' AND IS_EMPTY(XML1.MA_SO_HSCN)",
    "CANH_BAO": "⛔ QĐ 130: Chuyển tuyến bắt buộc phải có Mã số hồ sơ chuyển tuyến điện tử.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_89",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_89",
    "TEN_QUY_TAC": "Chẩn đoán nơi đi mâu thuẫn nơi đến",
    "DIEU_KIEN": "XML1.MA_BENH_NOI_DI != XML1.MA_BENH_CHINH AND XML1.MA_LYDO_VVIEN == '3'",
    "CANH_BAO": "⚠️ Thông tin: Chẩn đoán tại bệnh viện chuyển đi khác với chẩn đoán tại bệnh viện tiếp nhận.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_90",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_90",
    "TEN_QUY_TAC": "Mã thuốc không có trong danh mục thầu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Từ chối: Thuốc chưa được phê duyệt trúng thầu trên hệ thống kiểm tra.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc danh mục DM_THAU_QUOC_GIA không thấy được nạp vào context engine hiện tại; để ON sẽ không chứng minh được đầu vào hợp lệ tại runtime. Điều kiện gốc: XML2.MA_THUOC NOT IN (DM_THAU_QUOC_GIA) AND IS_EMPTY(XML2.TT_THAU)"
  },
  {
    "id": "SEED_HANHCHINH_91",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_91",
    "TEN_QUY_TAC": "Thuốc phóng xạ thiếu mã an toàn",
    "DIEU_KIEN": "XML2.MA_NHOM == 'PHONG_XA' AND IS_EMPTY(XML2.MA_AN_TOAN)",
    "CANH_BAO": "⚠️ JCI Safety: Thuốc phóng xạ bắt buộc đi kèm mã kiểm soát an toàn bức xạ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_92",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_92",
    "TEN_QUY_TAC": "VTYT có đơn giá bằng 0",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM == '10' AND DON_GIA == 0) > 0",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Vật tư y tế thanh toán BHYT không được có đơn giá bằng 0.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_93",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_93",
    "TEN_QUY_TAC": "Thuốc tự bào chế thiếu bảng kê",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Thiếu hồ sơ: Có thuốc tự bào chế nhưng thiếu chi tiết thành phần tại XML11.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_94",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_94",
    "TEN_QUY_TAC": "Vật tư thay thế sai mã GPNK",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM == '10' AND IS_EMPTY(SO_GPNK))",
    "CANH_BAO": "⛔ Pháp lý: Vật tư nhập khẩu bắt buộc phải có số Giấy phép nhập khẩu (GPNK).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_95",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_95",
    "TEN_QUY_TAC": "Thời gian điều trị nội trú < 4 giờ",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND DATEDIFF_MINUTE(XML1.NGAY_VAO, XML1.NGAY_RA) < 240",
    "CANH_BAO": "⚠️ Xuất toán: Thời gian nằm viện dưới 4h phải chuyển về diện ngoại trú/lưu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_96",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_96",
    "TEN_QUY_TAC": "Ra viện không có chẩn đoán ra viện",
    "DIEU_KIEN": "XML1.MA_LOAI_RV != '' AND IS_EMPTY(XML1.MA_BENH_CHINH)",
    "CANH_BAO": "⛔ Lỗi hồ sơ: Bệnh nhân đã làm thủ tục ra viện nhưng thiếu mã bệnh ra viện (ICD-10).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_97",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_97",
    "TEN_QUY_TAC": "Giấy ra viện thiếu chữ ký lãnh đạo",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Pháp lý: Giấy ra viện điện tử bắt buộc có chữ ký số của lãnh đạo đơn vị.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_98",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_98",
    "TEN_QUY_TAC": "Tóm tắt hồ sơ thiếu phương pháp ĐT",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND IS_EMPTY(XML1.PP_DIEU_TRI)",
    "CANH_BAO": "⛔ Lỗi XML1: Bệnh án nội trú thiếu tóm tắt phương pháp điều trị chính.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_99",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_99",
    "TEN_QUY_TAC": "Mã lý do ra viện không hợp lệ",
    "DIEU_KIEN": "XML1.MA_LOAI_RV NOT IN ('1','2','3','4','5')",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã lý do ra viện sai quy định của Bộ Y tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_100",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_100",
    "TEN_QUY_TAC": "Tổng tiền thanh toán sai công thức",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi toán học: Tổng chi phí không bằng tổng các tiểu mục thành phần.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc chứng thư/metadata ngoài schema XML KCB BHYT. Điều kiện gốc: XML1.NGAY_TTOAN > CERTIFICATE_EXPIRY_DATE"
  },
  {
    "id": "SEED_HANHCHINH_101",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_101",
    "TEN_QUY_TAC": "Tiền xét nghiệm XML1 và XML3 lệch",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi đồng bộ: Tổng tiền xét nghiệm ở bảng tổng và bảng chi tiết bị lệch.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_XN - SUM(XML3.THANH_TIEN WHERE MA_NHOM==2)) > 1"
  },
  {
    "id": "SEED_HANHCHINH_102",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_102",
    "TEN_QUY_TAC": "Tiền chẩn đoán hình ảnh lệch",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi đồng bộ: Tổng tiền CDHA ở bảng tổng và bảng chi tiết bị lệch.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_CDHA - SUM(XML3.THANH_TIEN WHERE MA_NHOM==3)) > 1"
  },
  {
    "id": "SEED_HANHCHINH_103",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_103",
    "TEN_QUY_TAC": "Chi phí vận chuyển vượt định mức",
    "DIEU_KIEN": "XML3.MA_DICH_VU == 'VC' AND XML3.THANH_TIEN > (XML3.SO_KM * 15000)",
    "CANH_BAO": "⚠️ Kiểm tra: Chi phí vận chuyển vượt quá định mức giá/km thông thường.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_104",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_104",
    "TEN_QUY_TAC": "Tiền khám vượt số lượt quy định",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM == '01') > 2",
    "CANH_BAO": "⚠️ Cảnh báo: Một ngày bệnh nhân khám quá 2 chuyên khoa (Dễ bị từ chối công khám thứ 3).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_105",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_105",
    "TEN_QUY_TAC": "Mã bác sĩ không có tên trong danh mục",
    "DIEU_KIEN": "IS_EMPTY(GET_STAFF_NAME(XML1.MA_TTDV))",
    "CANH_BAO": "⛔ Lỗi hệ thống: Mã bác sĩ trên hồ sơ không tồn tại trong danh mục nhân sự BV.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_106",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_106",
    "TEN_QUY_TAC": "Bác sĩ chỉ định đang trong thời gian nghỉ",
    "DIEU_KIEN": "CHECK_STAFF_OFF(XML3.MA_BAC_SI, XML3.NGAY_YL) == TRUE",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Bác sĩ đang nghỉ phép/không trực nhưng vẫn phát sinh y lệnh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_107",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_107",
    "TEN_QUY_TAC": "Khoa điều trị không khớp mã giường",
    "DIEU_KIEN": "GET_DEPT(XML3.MA_GIUONG) != XML1.MA_KHOA",
    "CANH_BAO": "⚠️ Kiểm tra: Bệnh nhân nằm tại khoa Nội nhưng tính tiền giường của khoa Ngoại.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_108",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_108",
    "TEN_QUY_TAC": "Bác sĩ ký hồ sơ không phải điều trị",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Audit: Người điều trị chính và người ký hồ sơ số hóa không khớp nhau.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: NOT IS_EMPTY(HIS.MA_BS_KY_SO) AND XML1.MA_TTDV != HIS.MA_BS_KY_SO"
  },
  {
    "id": "SEED_HANHCHINH_109",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_109",
    "TEN_QUY_TAC": "Tên file XML sai quy định",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Tên file XML không đúng cấu trúc (Mã BV_Ngày_Mã LK).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc metadata file/header không có trong payload XML nghiệp vụ. Điều kiện gốc: FILE_NAME NOT MATCHES /^[0-9]{5}_[0-9]{8}_.*\\\\.xml$/"
  },
  {
    "id": "SEED_HANHCHINH_110",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_110",
    "TEN_QUY_TAC": "File XML chứa ký tự BOM",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi cấu trúc: File XML không được chứa ký tự BOM ở đầu (Cổng BHXH sẽ từ chối).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc metadata file/header không có trong payload XML nghiệp vụ. Điều kiện gốc: FILE_ENCODING == 'UTF-8-BOM'"
  },
  {
    "id": "SEED_HANHCHINH_111",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_111",
    "TEN_QUY_TAC": "Thiếu thẻ đóng XML",
    "DIEU_KIEN": "XML_STRUCTURE_VALID == FALSE",
    "CANH_BAO": "⛔ Lỗi nghiêm trọng: Tệp XML bị cắt cụt hoặc thiếu thẻ đóng </xml>.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_112",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_112",
    "TEN_QUY_TAC": "Sai mã bảng dữ liệu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã bảng trong Header không khớp với nội dung dữ liệu bên dưới.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.TABLE_ID NOT IN ('XML1','XML2','XML3'...)"
  },
  {
    "id": "SEED_HANHCHINH_113",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_113",
    "TEN_QUY_TAC": "Bệnh nhân không có cân nặng/chiều cao",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI COP: Bệnh nhân nội trú thiếu chỉ số BMI cơ bản để tính liều thuốc.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu JCI.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_LOAI_KCB == '3' AND (IS_EMPTY(JCI.CAN_NANG) OR IS_EMPTY(JCI.CHIEU_CAO))"
  },
  {
    "id": "SEED_HANHCHINH_114",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_114",
    "TEN_QUY_TAC": "Thiếu ghi chú dị ứng tại XML1",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI Safety: Trường thông tin dị ứng không được để trống (Phải ghi \"Không\" nếu không có).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu JCI.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: IS_EMPTY(JCI.DI_UNG)"
  },
  {
    "id": "SEED_HANHCHINH_115",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_115",
    "TEN_QUY_TAC": "Mã định danh đơn thuốc điện tử sai",
    "DIEU_KIEN": "XML2.MA_DON_THUOC != '' AND LEN(XML2.MA_DON_THUOC) != 12",
    "CANH_BAO": "⛔ Lỗi quốc gia: Mã đơn thuốc điện tử phải đúng 12 ký tự theo chuẩn liên thông.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_116",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_116",
    "TEN_QUY_TAC": "Chênh lệch tiền thuốc do làm tròn > 10đ",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kế toán: Lệch tiền thuốc quá lớn (10 đồng), cần kiểm tra lại đơn giá và số lượng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_THUOC - SUM(XML2.THANH_TIEN)) > 10"
  },
  {
    "id": "SEED_HANHCHINH_117",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_117",
    "TEN_QUY_TAC": "Thiếu ngày kết thúc đợt điều trị",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '2' AND IS_EMPTY(XML1.NGAY_KET_THUC)",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Điều trị ngoại trú mạn tính thiếu ngày kết thúc đợt.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_118",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_118",
    "TEN_QUY_TAC": "Trẻ sơ sinh chưa có tên (Con bà...)",
    "DIEU_KIEN": "LEN(XML1.MA_THE_TAM) > 0 AND DIFF_DAYS(XML1.NGAY_SINH, TODAY) > 15",
    "CANH_BAO": "⚠️ Audit: Trẻ sơ sinh trên 15 ngày tuổi nên cập nhật họ tên chính thức.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_119",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_119",
    "TEN_QUY_TAC": "Sai mã dịch vụ ngày giường cuối",
    "DIEU_KIEN": "XML1.NGAY_RA == XML3.NGAY_YL AND XML3.MA_DICH_VU == 'G_TRON_NGAY'",
    "CANH_BAO": "⚠️ BHYT: Ngày ra viện không được tính trọn ngày giường (trừ trường hợp đặc biệt).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_120",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_120",
    "TEN_QUY_TAC": "Bệnh nhân nội trú thiếu nhóm máu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI Safety: Bệnh nhân nằm viện nội trú nên được định nhóm máu sẵn trong hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_LOAI_KCB == '3' AND IS_EMPTY(HIS.NHOM_MAU)"
  },
  {
    "id": "SEED_HANHCHINH_121",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_121",
    "TEN_QUY_TAC": "Gửi thiếu bảng XML4 (Cận lâm sàng)",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM IN (2,3)) > 0 AND COUNT(XML4) == 0",
    "CANH_BAO": "⛔ Thiếu hồ sơ: Có phát sinh tiền XN/CDHA nhưng không gửi kèm kết quả tại XML4.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_122",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_122",
    "TEN_QUY_TAC": "Chữ ký số hết hạn tại ngày ký",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Pháp lý: Chữ ký số của bác sĩ hoặc bệnh viện đã hết hạn tại thời điểm ký hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc chứng thư/metadata ngoài schema XML KCB BHYT. Điều kiện gốc: XML1.NGAY_KY_SO > CERTIFICATE_EXPIRY_DATE"
  },
  {
    "id": "SEED_HANHCHINH_123",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_123",
    "TEN_QUY_TAC": "Thẻ quân nhân (QN) thiếu đơn vị quản lý",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Thiếu thông tin: Đối tượng quân nhân bắt buộc phải có tên đơn vị quản lý trên hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_THE_BHYT STARTS_WITH 'QN' AND IS_EMPTY(HIS.TEN_DON_VI)"
  },
  {
    "id": "SEED_HANHCHINH_124",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_124",
    "TEN_QUY_TAC": "Thẻ trẻ em (TE) không có ngày đủ 6 tuổi",
    "DIEU_KIEN": "XML1.NGAY_DU_6_TUOI = ADD_YEARS(XML1.NGAY_SINH, 6)",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Thẻ trẻ em bắt buộc phải có thông tin ngày trẻ tròn 72 tháng tuổi.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_125",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_125",
    "TEN_QUY_TAC": "Thẻ BHYT thuộc diện 5 năm liên tục",
    "DIEU_KIEN": "XML1.NAM_NAM_LIEN_TUC != '' AND XML1.T_BNCCT > LIMIT_BASE_SALARY",
    "CANH_BAO": "⚠️ Cảnh báo: BN đã đủ 5 năm liên tục, kiểm tra số tiền cùng chi trả để miễn giảm theo quy định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_126",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_126",
    "TEN_QUY_TAC": "Thời gian vào khoa sau y lệnh đầu tiên",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi quy trình: Phát hiện y lệnh thuốc/dịch vụ trước khi bệnh nhân thực hiện vào khoa điều trị.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.NGAY_VAO_KHOA > MIN(XML2_3.NGAY_YL)"
  },
  {
    "id": "SEED_HANHCHINH_127",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_127",
    "TEN_QUY_TAC": "Khám ngoại trú nhưng có mã giường",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND COUNT_IF(XML3, MA_NHOM IN (14,15)) > 0",
    "CANH_BAO": "⛔ Xuất toán: Ngoại trú không được tính tiền giường nội trú (trừ giường lưu không BHYT).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_128",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_128",
    "TEN_QUY_TAC": "Điều trị nội trú thiếu mã bác sĩ cho bệnh kèm",
    "DIEU_KIEN": "COUNT(XML1.MA_BENH_KT) > 0 AND IS_EMPTY(XML1.MA_BS_CHUYEN_KHOA)",
    "CANH_BAO": "⚠️ JCI Audit: Có chẩn đoán bệnh kèm chuyên khoa nhưng thiếu mã bác sĩ chuyên khoa hội chẩn.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_129",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_129",
    "TEN_QUY_TAC": "Ra viện diện trốn viện (Lý do 4)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Bệnh nhân trốn viện thường để trạng thái \"Không thay đổi\" (3), yêu cầu rà soát.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.MA_KHOA_LAP NOT IN (DM_KHOA_PHUONG_CHAU)"
  },
  {
    "id": "SEED_HANHCHINH_130",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_130",
    "TEN_QUY_TAC": "Số ngày điều trị nội trú lệch VBHN 17 (ngày giường)",
    "DIEU_KIEN": "KY_VONG_SO_NGAY_DTRI_VBHN17(XML1) != null && TO_NUMBER(XML1.SO_NGAY_DTRI) != KY_VONG_SO_NGAY_DTRI_VBHN17(XML1)",
    "CANH_BAO": "⛔ Lỗi kế toán: SO_NGAY_DTRI không khớp quy đếm ngày điều trị nội trú theo VBHN 17 (≤4h→0; >4h–<24h cùng ngày/qua đêm→1; trường hợp (a) D+1 với KET_QUA_DTRI=5 hoặc chuyển MA_LOAI_RV 2/3; còn lại (b) D = ngày ra − ngày vào theo lịch).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ VBHN 17: thay so khớp thuần DIFF_DAYS bằng KY_VONG_SO_NGAY_DTRI_VBHN17(XML1) trong dong_co_giam_dinh.jsx"
  },
  {
    "id": "SEED_HANHCHINH_131",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_131",
    "TEN_QUY_TAC": "Thông tuyến huyện sai mức hưởng",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '5' AND XML1.T_BHTT < XML1.T_TONGCHI_BH",
    "CANH_BAO": "⚠️ Kiểm tra: BN thông tuyến huyện được hưởng 100% mức quyền lợi, cần rà soát lại mức hưởng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_132",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_132",
    "TEN_QUY_TAC": "Chuyển tuyến từ trạm y tế (TYT)",
    "DIEU_KIEN": "LEN(XML1.MA_NOI_DI) == 5 AND XML1.MA_NOI_DI STARTS_WITH '95'",
    "CANH_BAO": "⚠️ Thông tin: BN chuyển tuyến từ TYT địa phương, kiểm tra tính hợp lệ của Giấy chuyển tuyến.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_133",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_133",
    "TEN_QUY_TAC": "Giấy hẹn khám lại thiếu chữ ký BS",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Pháp lý: Giấy hẹn khám lại trên hệ thống điện tử bắt buộc phải được ký số.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_134",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_134",
    "TEN_QUY_TAC": "Chuyển tuyến diện cấp cứu mâu thuẫn",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '2' AND XML1.MA_NOI_DI != ''",
    "CANH_BAO": "⚠️ Logic: BN diện cấp cứu (2) nhưng lại khai báo mã nơi đi (thường dùng cho Chuyển tuyến - 3).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_135",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_135",
    "TEN_QUY_TAC": "Giấy chuyển tuyến quá hạn 1 năm",
    "DIEU_KIEN": "DATEDIFF_DAY(XML1.NGAY_GIAY_CHUYEN_TUYEN, XML1.NGAY_VAO) > 365",
    "CANH_BAO": "⛔ Từ chối: Giấy chuyển tuyến điều trị mạn tính có giá trị tối đa 1 năm (tính theo năm dương lịch).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_136",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_136",
    "TEN_QUY_TAC": "Thuốc thiếu mã số đăng ký (SDK)",
    "DIEU_KIEN": "COUNT_IF(XML2, IS_EMPTY(SO_DANG_KY)) > 0",
    "CANH_BAO": "⛔ Lỗi cấu trúc: Thuốc thanh toán BHYT bắt buộc phải có số đăng ký hoặc số GPNK.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_137",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_137",
    "TEN_QUY_TAC": "Dịch vụ kỹ thuật thiếu mã theo TT22",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi danh mục: Mã dịch vụ kỹ thuật không đúng cấu trúc quy định tại Thông tư 22/2023.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_138",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_138",
    "TEN_QUY_TAC": "Đơn giá thuốc bệnh viện tự thầu",
    "DIEU_KIEN": "XML2.MA_NGUON_CT == 'BV' AND XML2.DON_GIA > PRICE_BID_PROVINCE",
    "CANH_BAO": "⚠️ Kiểm tra: Giá thuốc tự thầu tại BV cao hơn giá trúng thầu tập trung của tỉnh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_139",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_139",
    "TEN_QUY_TAC": "Giấy nghỉ dưỡng thai thiếu số tuần",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Pháp lý: Giấy chứng nhận nghỉ dưỡng thai hưởng BHXH bắt buộc ghi rõ số tuần thai.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_140",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_140",
    "TEN_QUY_TAC": "Tóm tắt hồ sơ thiếu hướng điều trị tiếp",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi XML7: Giấy ra viện thiếu thông tin dặn dò/hướng dẫn điều trị tiếp theo.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_141",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_141",
    "TEN_QUY_TAC": "Biên bản PTTT thiếu mã gây mê",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Thiếu dữ liệu: Biên bản phẫu thuật bắt buộc phải khai báo phương pháp gây mê thực tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_142",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_142",
    "TEN_QUY_TAC": "Kết quả CLS thiếu giá trị bình thường",
    "DIEU_KIEN": "XML4.GIA_TRI != '' AND IS_EMPTY(XML4.CHI_SO_BINH_THUONG)",
    "CANH_BAO": "⚠️ JCI Audit: Phiếu kết quả xét nghiệm thiếu dải chỉ số bình thường (Reference Range) để đối chiếu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_143",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_143",
    "TEN_QUY_TAC": "Hồ sơ tử vong thiếu thời điểm tử vong",
    "DIEU_KIEN": "XML1.KET_QUA_DTRI == '5' AND LEN(XML1.NGAY_TU_VONG) != 12",
    "CANH_BAO": "⛔ Lỗi nghiêm trọng: Bệnh nhân tử vong phải ghi chính xác Ngày/Giờ/Phút tử vong.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_144",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_144",
    "TEN_QUY_TAC": "Tiền xét nghiệm XML1 âm",
    "DIEU_KIEN": "XML1.T_XN < 0",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Giá trị tiền xét nghiệm bị âm trên file tổng hợp.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_145",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_145",
    "TEN_QUY_TAC": "Lỗi tính tiền BHTT cho đối tượng nghèo",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'HN' AND XML1.T_BHTT < XML1.T_TONGCHI_BH",
    "CANH_BAO": "⚠️ Kiểm tra: Đối tượng Nghèo (HN) nhưng tiền BHYT trả nhỏ hơn tổng chi phí (Nghi ngờ trừ sai). [OFF: Trùng PC_QL_16 - Dòng 26 đã bao quát HN+DT]",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_146",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_146",
    "TEN_QUY_TAC": "Chi phí chênh lệch giá (Nguồn khác)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Giải trình: Có phát sinh chi phí từ nguồn khác (không phải BHYT/BN), cần ghi rõ lý do.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.T_NGUONKHAC > 0 AND IS_EMPTY(HIS.LY_DO_NGUON_KHAC)"
  },
  {
    "id": "SEED_HANHCHINH_147",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_147",
    "TEN_QUY_TAC": "Tổng tiền vật tư lẻ hàng đơn vị",
    "DIEU_KIEN": "XML1.T_VTYT != ROUND(XML1.T_VTYT, 0)",
    "CANH_BAO": "⛔ Lỗi làm tròn: Tiền vật tư y tế thanh toán BHYT phải là số nguyên theo quy định.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_148",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_148",
    "TEN_QUY_TAC": "Sai lệch số tiền miễn giảm",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi tài chính: Số tiền miễn giảm lớn hơn cả số tiền bệnh nhân phải cùng chi trả.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.T_MIEN_GIAM > (XML1.T_TONGCHI_BV - XML1.T_BHTT)"
  },
  {
    "id": "SEED_HANHCHINH_149",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_149",
    "TEN_QUY_TAC": "Giám đốc chưa ký duyệt hồ sơ",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Từ chối: Tệp XML chưa có thông tin xác nhận ký điện tử của Ban Giám đốc cơ sở.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: NOT IS_EMPTY(HIS.TRANG_THAI_KY_GD) AND HIS.TRANG_THAI_KY_GD == 0"
  },
  {
    "id": "SEED_HANHCHINH_150",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_150",
    "TEN_QUY_TAC": "Ngày ký điện tử trước ngày lập bảng",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi logic: Thời điểm ký số không thể xảy ra trước thời điểm tạo lập dữ liệu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.NGAY_TTOAN < HIS.NGAY_LAP"
  },
  {
    "id": "SEED_HANHCHINH_151",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_151",
    "TEN_QUY_TAC": "Bác sĩ điều trị thiếu chứng chỉ hành nghề",
    "DIEU_KIEN": "IS_EMPTY(GET_CCHN(XML1.MA_TTDV))",
    "CANH_BAO": "⛔ Pháp lý: Mã bác sĩ điều trị không gắn kèm số Chứng chỉ hành nghề (CCHN).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_152",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_152",
    "TEN_QUY_TAC": "Mã khoa lập hồ sơ không tồn tại",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hệ thống: Mã khoa/phòng tạo lập hồ sơ không nằm trong danh mục nội bộ bệnh viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc danh mục nội bộ DM_KHOA_PHUONG_CHAU mang tính cục bộ cơ sở, không thấy được nạp như dữ liệu chuẩn trong engine hiện tại. Điều kiện gốc: XML1.MA_KHOA_LAP NOT IN (DM_KHOA_PHUONG_CHAU)"
  },
  {
    "id": "SEED_HANHCHINH_153",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_153",
    "TEN_QUY_TAC": "BN nhi thiếu tên người giám hộ",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI COP: Bệnh nhân là trẻ em bắt buộc phải khai báo tên cha hoặc mẹ hoặc người giám hộ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: NOT IS_EMPTY(HIS.DIA_CHI_TT) AND NOT IS_EMPTY(HIS.DIA_CHI_TAM_TRU) AND HIS.DIA_CHI_TT == HIS.DIA_CHI_TAM_TRU"
  },
  {
    "id": "SEED_HANHCHINH_154",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_154",
    "TEN_QUY_TAC": "BN quốc tế thiếu mã quốc gia (ISO)",
    "DIEU_KIEN": "XML1.MA_QUOCTICH NOT IN ('704', 'VNM', 'VN')AND LEN(XML1.MA_QUOCTICH) NOT IN (2, 3)",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã quốc gia phải theo chuẩn ISO 3166-1 alpha-3 (3 số).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_155",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_155",
    "TEN_QUY_TAC": "Tiền khám lượt 3 trở đi tính BHYT",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Xuất toán: Công khám thứ 3 trong cùng một ngày không được tính BHYT (theo Thông tư 22).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: COUNT_IF(XML3, MA_NHOM == '01') > 2 AND SUM(XML3.T_BHTT) > 0"
  },
  {
    "id": "SEED_HANHCHINH_156",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_156",
    "TEN_QUY_TAC": "Sai mã hình thức vào viện",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.MA_LYDO_VVIEN) AND XML1.MA_LYDO_VVIEN NOT IN ('1','2','3','4')",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã lý do vào viện chỉ nhận giá trị từ 1 (Đúng tuyến) đến 4 (Tự đến).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_157",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_157",
    "TEN_QUY_TAC": "Số định danh cá nhân trùng Mã thẻ BHYT",
    "DIEU_KIEN": "XML1.SO_CCCD == SUBSTR(XML1.MA_THE_BHYT, 5, 10)",
    "CANH_BAO": "⚠️ Thông tin: Xác nhận BN đã đồng bộ Số định danh cá nhân với mã số BHXH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_158",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_158",
    "TEN_QUY_TAC": "Khám bằng hình ảnh thẻ trên VssID",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Pháp lý: Khám qua ứng dụng VssID/VNeID bắt buộc phải có mã xác thực từ hệ thống.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: EXT.HINH_THUC_THE == 'VSSID' AND IS_EMPTY(EXT.MA_XAC_THUC)"
  },
  {
    "id": "SEED_HANHCHINH_159",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_159",
    "TEN_QUY_TAC": "BN từ chối cung cấp CCCD",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Nhắc nhở: BN trên 14 tuổi chưa cung cấp CCCD, cần hướng dẫn BN đồng bộ dữ liệu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: (FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) >= 14)AND IS_EMPTY(XML1.SO_CCCD)"
  },
  {
    "id": "SEED_HANHCHINH_160",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_160",
    "TEN_QUY_TAC": "Địa chỉ thường trú sai mã xã",
    "DIEU_KIEN": "LEN(XML1.MAXA_CU_TRU) != 5",
    "CANH_BAO": "⛔ Lỗi cấu trúc: Mã xã/phường thường trú phải có 5 chữ số theo danh mục TCTK.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_161",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_161",
    "TEN_QUY_TAC": "Sai logic mã thẻ tạm và số định danh",
    "DIEU_KIEN": "XML1.MA_THE_TAM == 1 AND IS_EMPTY(XML1.SO_CCCD)",
    "CANH_BAO": "⚠️ Kiểm tra: Sử dụng thẻ tạm (giấy tờ thay thế) nên đi kèm số CCCD để đối soát.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_162",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_162",
    "TEN_QUY_TAC": "Thiếu mã bệnh viện chuyển đến",
    "DIEU_KIEN": "XML1.MA_LOAI_RV == '2' AND IS_EMPTY(XML1.MA_NOI_DEN)",
    "CANH_BAO": "⛔ Lỗi hồ sơ: Chuyển viện (2) nhưng không khai báo mã bệnh viện tuyến trên chuyển đến.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_163",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_163",
    "TEN_QUY_TAC": "Sai định dạng Ngày giờ y lệnh (Phút lẻ)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Phút trong thời gian y lệnh không được vượt quá 59.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_164",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_164",
    "TEN_QUY_TAC": "Tổng tiền thanh toán bị làm tròn sai số",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kế toán: Tổng chi phí trên XML1 lệch so với tổng chi tiết vượt mức sai số cho phép.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_TONGCHI_BH - SUM(XML2_3.THANH_TIEN_BH)) > 0.5"
  },
  {
    "id": "SEED_HANHCHINH_165",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_165",
    "TEN_QUY_TAC": "Bệnh nhân ra viện nhưng hồ sơ chưa đóng",
    "DIEU_KIEN": "XML1.NGAY_RA != '' AND XML1.TRANG_THAI_HS == 'OPEN'",
    "CANH_BAO": "⚠️ Cảnh báo: Bệnh nhân đã ra viện trên thực tế nhưng trạng thái hồ sơ trên HIS vẫn đang mở.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_166",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_166",
    "TEN_QUY_TAC": "Tệp XML thiếu mã ký số cơ quan",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Từ chối: Toàn bộ gói dữ liệu XML chưa được ký số ở cấp độ tổ chức (Cơ sở KCB).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.SIGNATURE_STATUS == FALSE"
  },
  {
    "id": "SEED_HANHCHINH_167",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_167",
    "TEN_QUY_TAC": "Diễn biến lâm sàng sau giờ tử vong",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_TU_VONG) AND XML5.NGAY_DB > XML1.NGAY_TU_VONG",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Ghi nhận diễn biến lâm sàng sau khi người bệnh đã tử vong.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_168",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_168",
    "TEN_QUY_TAC": "Giờ kết thúc mổ sau giờ ra viện",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi logic: Thời điểm kết thúc phẫu thuật muộn hơn thời điểm bệnh nhân làm thủ tục ra viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_169",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_169",
    "TEN_QUY_TAC": "Ngày chỉ định thuốc trước ngày sinh",
    "DIEU_KIEN": "MIN(XML2.NGAY_YL) < XML1.NGAY_SINH",
    "CANH_BAO": "⛔ Lỗi dữ liệu: Y lệnh thuốc phát sinh trước cả ngày sinh của bệnh nhân.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_170",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_170",
    "TEN_QUY_TAC": "Thời gian gây mê vượt quá 24h",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Thời gian gây mê kéo dài bất thường (>24h), yêu cầu bác sĩ rà soát lại.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_171",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_171",
    "TEN_QUY_TAC": "Hồ sơ nội trú thiếu bảng diễn biến",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND COUNT(XML5) == 0",
    "CANH_BAO": "⛔ Lỗi hồ sơ: Điều trị nội trú bắt buộc phải có dữ liệu diễn biến bệnh hàng ngày (XML5).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_172",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_172",
    "TEN_QUY_TAC": "Giấy ra viện thiếu mã bệnh chính",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Thiếu dữ liệu: Giấy ra viện điện tử bắt buộc phải có mã bệnh ICD-10 ra viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_173",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_173",
    "TEN_QUY_TAC": "Hồ sơ ngoại trú có bảng diễn biến",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND COUNT(XML5) > 0",
    "CANH_BAO": "⚠️ Thông tin: Lượt khám ngoại trú thông thường không nhất thiết phải gửi bảng diễn biến (XML5).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_174",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_174",
    "TEN_QUY_TAC": "Tổng tiền giường lệch với chi tiết",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi đồng bộ: Tiền giường trên XML1 lệch so với tổng tiền giường tại XML3.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_GIUONG - SUM(XML3.THANH_TIEN WHERE MA_NHOM IN (14,15))) > 1"
  },
  {
    "id": "SEED_HANHCHINH_175",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_175",
    "TEN_QUY_TAC": "Tổng chi phí bằng 0 (Nội trú)",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND XML1.T_TONGCHI_BH == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Hồ sơ nội trú nhưng không phát sinh bất kỳ chi phí nào (Nghi ngờ lỗi dữ liệu). [OFF: Trùng XML_519 - Dòng 222 tổng quát hơn cho mọi loại KCB]",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_176",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_176",
    "TEN_QUY_TAC": "Mã dịch vụ kỹ thuật trùng mã thuốc",
    "DIEU_KIEN": "XML3.MA_DICH_VU == XML2.MA_THUOC",
    "CANH_BAO": "⚠️ Cảnh báo: Phát hiện sự trùng lặp mã giữa danh mục thuốc và danh mục dịch vụ kỹ thuật.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_177",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_177",
    "TEN_QUY_TAC": "Mã PTTT quốc tế không chuẩn",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã phẫu thuật quốc tế (ICD-9/ICD-10-PCS) sai cấu trúc.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_178",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_178",
    "TEN_QUY_TAC": "Đơn vị tính thuốc chứa số",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Đơn vị tính (viên, gói...) không nên chứa ký số, cần kiểm tra lại.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_179",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_179",
    "TEN_QUY_TAC": "Sai mã nhóm vật tư (Thông tư 04)",
    "DIEU_KIEN": "XML3.MA_NHOM IN ('10','11') AND XML3.MA_NHOM NOT IN ('1','2','3','4','5','6','7','8','9','10','11')",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã nhóm vật tư y tế phải theo đúng 11 nhóm quy định của BYT.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_180",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_180",
    "TEN_QUY_TAC": "Bác sĩ mổ và bác sĩ điều trị khác nhau",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Thông tin: Phẫu thuật viên chính không phải là bác sĩ điều trị chính của hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_181",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_181",
    "TEN_QUY_TAC": "Mã nơi đến sai định dạng",
    "DIEU_KIEN": "XML1.MA_LOAI_RV == '2' AND LEN(XML1.MA_NOI_DEN) != 5",
    "CANH_BAO": "⛔ Lỗi cấu trúc: Mã cơ sở KCB nhận chuyển (MA_NOI_DEN) phải đúng 5 ký tự.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_182",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_182",
    "TEN_QUY_TAC": "Người lập bảng và bác sĩ điều trị trùng nhau",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Audit: Bác sĩ điều trị tự lập bảng tổng hợp dữ liệu, cần kiểm tra quy trình đối soát.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.NGUOI_LAP == XML1.MA_TTDV"
  },
  {
    "id": "SEED_HANHCHINH_183",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_183",
    "TEN_QUY_TAC": "Chữ ký số bệnh viện bị thiếu",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Từ chối: Gói dữ liệu XML thiếu chữ ký số xác thực của cơ sở KCB.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.MA_CSKCB_SIGN == ''"
  },
  {
    "id": "SEED_HANHCHINH_184",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_184",
    "TEN_QUY_TAC": "Ngày ký hồ sơ sau ngày gửi cổng",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi logic: Ngày ký số hồ sơ nằm ở thời điểm tương lai so với hiện tại.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc ngữ cảnh runtime ngoài dữ liệu XML hồ sơ. Điều kiện gốc: XML1.NGAY_TTOAN > GET_CURRENT_TIMESTAMP()"
  },
  {
    "id": "SEED_HANHCHINH_185",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_185",
    "TEN_QUY_TAC": "Bác sĩ chưa có chứng chỉ ký số",
    "DIEU_KIEN": "CHECK_DIGITAL_CERT(XML1.MA_TTDV) == FALSE",
    "CANH_BAO": "⛔ Pháp lý: Bác sĩ điều trị chưa đăng ký chứng thư số để ký hồ sơ điện tử.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_186",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_186",
    "TEN_QUY_TAC": "Sai mã kết quả điều trị (Nghèo)",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '2' AND IS_EMPTY(XML1.NGAY_RA)",
    "CANH_BAO": "⚠️ Kiểm tra: Đối tượng Nghèo nhưng kết quả điều trị ghi \"Xin về\" (4), cần kiểm tra hỗ trợ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_187",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_187",
    "TEN_QUY_TAC": "Có tạng hiến nhưng thiếu mã tạng",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Thiếu dữ liệu: Chẩn đoán ghép tạng nhưng thiếu chi tiết mã tạng tại bảng XML11.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_188",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_188",
    "TEN_QUY_TAC": "Thiếu giấy chứng sinh (Bé sơ sinh)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Pháp lý: Trẻ sơ sinh ra viện thiếu thông tin giấy chứng sinh điện tử.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: (DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) <= 7)AND COUNT(XML12.LOAI_GIAY == 'CHUNG_SINH') == 0"
  },
  {
    "id": "SEED_HANHCHINH_189",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_189",
    "TEN_QUY_TAC": "Nghỉ dưỡng thai quá 10 ngày/lần",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Kiểm tra: Số ngày nghỉ dưỡng thai vượt định mức thông thường cho một lần cấp giấy.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_190",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_190",
    "TEN_QUY_TAC": "Giấy hẹn khám lại trước ngày ra viện",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_TAI_KHAM) AND XML1.NGAY_TAI_KHAM < XML1.NGAY_RA",
    "CANH_BAO": "⛔ Lỗi logic: Ngày hẹn tái khám không thể trước ngày bệnh nhân ra viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_191",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_191",
    "TEN_QUY_TAC": "Tên bảng dữ liệu viết thường",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Tên bảng (xml1, xml2...) nên được viết hoa theo chuẩn QĐ 130.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.TABLE_ID != UPPER(XML_HEADER.TABLE_ID)"
  },
  {
    "id": "SEED_HANHCHINH_192",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_192",
    "TEN_QUY_TAC": "File XML chứa ký tự lạ (Non-UTF8)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Tệp tin chứa ký tự không thuộc bảng mã UTF-8 gây lỗi hiển thị.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc metadata file/header không có trong payload XML nghiệp vụ. Điều kiện gốc: FILE_ENCODING != 'UTF-8'"
  },
  {
    "id": "SEED_HANHCHINH_193",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_193",
    "TEN_QUY_TAC": "Mã lượt khám chứa dấu cách",
    "DIEU_KIEN": "XML1.MA_LK LIKE '% %'",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Mã lượt khám (MA_LK) không được chứa khoảng trắng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_194",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_194",
    "TEN_QUY_TAC": "Sai định dạng số điện thoại",
    "DIEU_KIEN": "LEN(XML1.DIEN_THOAI) < 10 AND XML1.DIEN_THOAI != ''",
    "CANH_BAO": "⚠️ Lỗi hành chính: Số điện thoại liên lạc không đủ 10 chữ số.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_195",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_195",
    "TEN_QUY_TAC": "Thiếu thông tin cổng tiếp nhận (Portal)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi hệ thống: Gói dữ liệu thiếu thông tin định danh cổng tiếp nhận BHXH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.RECEIVER_ID == ''"
  },
  {
    "id": "SEED_HANHCHINH_196",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_196",
    "TEN_QUY_TAC": "Dùng CCCD nhưng thiếu ngày cấp",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Định danh: Xác thực bằng CCCD gắn chip nên đi kèm thông tin ngày cấp thẻ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: EXT.HINH_THUC_THE == 'CCCD' AND IS_EMPTY(EXT.NGAY_CAP_CCCD)"
  },
  {
    "id": "SEED_HANHCHINH_197",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_197",
    "TEN_QUY_TAC": "Địa chỉ thường trú và tạm trú trùng nhau",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.DIA_CHI_TT) AND NOT IS_EMPTY(XML1.DIA_CHI_TAM_TRU) AND XML1.DIA_CHI_TT == XML1.DIA_CHI_TAM_TRU",
    "CANH_BAO": "⚠️ Thông tin: Xác nhận địa chỉ thường trú và tạm trú của bệnh nhân đồng nhất.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_198",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_198",
    "TEN_QUY_TAC": "Sai mã tỉnh cấp thẻ BHYT",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi định dạng: Mã tỉnh phát hành thẻ (2 số đầu sau ký hiệu chữ) không hợp lệ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc DM_MA_TINH_BHXH, chưa thấy được nạp vào context engine hiện tại. Điều kiện gốc: SUBSTR(XML1.MA_THE_BHYT, 3, 2) NOT IN (DM_MA_TINH_BHXH)"
  },
  {
    "id": "SEED_HANHCHINH_199",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_199",
    "TEN_QUY_TAC": "Thiếu thông tin dân tộc bệnh nhân",
    "DIEU_KIEN": "IS_EMPTY(XML1.MA_DANTOC)",
    "CANH_BAO": "⚠️ Lỗi hồ sơ: Trường thông tin dân tộc không được để trống theo quy định mới.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_200",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_200",
    "TEN_QUY_TAC": "Tổng tiền cùng chi trả (BNCCT) quá lớn",
    "DIEU_KIEN": "XML1.T_BNCCT > 10000000",
    "CANH_BAO": "⚠️ Cảnh báo: Tiền bệnh nhân trả vượt 10 triệu đồng, yêu cầu KHTH kiểm tra quyền lợi 5 năm.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_201",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_201",
    "TEN_QUY_TAC": "Bác sĩ điều trị nghỉ việc vẫn có tên",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "❌ LỖI PHÁP LÝ: Bác sĩ đã nghỉ việc nhưng vẫn đứng tên điều trị trên hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc danh mục thủ công DM_BS_NGHI_VIEC, không thấy được nạp như nguồn chuẩn vào context engine hiện tại. Điều kiện gốc: XML1.MA_TTDV IN (DM_BS_NGHI_VIEC)"
  },
  {
    "id": "SEED_HANHCHINH_202",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_202",
    "TEN_QUY_TAC": "Hồ sơ ra viện quá hạn đẩy cổng (> 15 ngày)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Hồ sơ quá hạn đẩy cổng 15 ngày, nguy cơ bị từ chối thanh toán rất cao.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_203",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_203",
    "TEN_QUY_TAC": "Tệp XML bị virus hoặc mã độc",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "❌ CẢNH BÁO AN NINH: Tệp XML bị nhiễm mã độc, hệ thống tự động cách ly.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc metadata file/header không có trong payload XML nghiệp vụ. Điều kiện gốc: FILE_SECURITY_SCAN == 'INFECTED'"
  },
  {
    "id": "SEED_HANHCHINH_204",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_204",
    "TEN_QUY_TAC": "Hồ sơ hoàn thiện sẵn sàng gửi cổng",
    "DIEU_KIEN": "COUNT_ERROR == 0 AND COUNT_WARNING < 5",
    "CANH_BAO": "✅ CHÚC MỪNG: Hồ sơ đạt chuẩn chất lượng, sẵn sàng truyền dữ liệu lên cổng BHXH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_205",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_205",
    "TEN_QUY_TAC": "Thẻ hưu trí (HT) sai mức hưởng",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'HT' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [Mức 3 / HT]: Theo QĐ 1018/QĐ-BHXH — ký hiệu số thứ 3 = 3 → 95% phạm vi chi trả (có giới hạn thuốc/VKT/DVKT); ngoại lệ 100% tuyến xã / một lần KCB dưới 15% LCS không kiểm tra trên XML1. T_BHTT chưa khớp tỷ lệ cơ bản so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_206",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_206",
    "TEN_QUY_TAC": "Thiếu ngày đủ 5 năm liên tục",
    "DIEU_KIEN": "XML1.MA_THE_BHYT != '' AND IS_EMPTY(XML1.NAM_NAM_LIEN_TUC)",
    "CANH_BAO": "⚠️ Cảnh báo: Thiếu thông tin mốc 5 năm liên tục, ảnh hưởng đến quyền lợi BN.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_207",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_207",
    "TEN_QUY_TAC": "Mâu thuẫn ngày miễn cùng chi trả",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_MIEN_CCT) AND XML1.NGAY_MIEN_CCT < XML1.NAM_NAM_LIEN_TUC",
    "CANH_BAO": "⛔ Lỗi logic: Ngày miễn cùng chi trả không thể trước ngày đủ mốc 5 năm.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_208",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_208",
    "TEN_QUY_TAC": "Thẻ BHYT trùng lặp tại 2 khoa",
    "DIEU_KIEN": "COUNT_DISTINCT(XML1.MA_KHOA) > 1 WHERE MA_LK == Current",
    "CANH_BAO": "⛔ Lỗi quy trình: Một lượt khám không được khai báo tại 2 khoa điều trị chính.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_209",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_209",
    "TEN_QUY_TAC": "Giờ vào khoa sau giờ ra viện",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Thời điểm vào khoa muộn hơn thời điểm ra viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.NGAY_VAO_KHOA > XML1.NGAY_RA"
  },
  {
    "id": "SEED_HANHCHINH_210",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_210",
    "TEN_QUY_TAC": "Thời gian khám bệnh = 0 phút",
    "DIEU_KIEN": "DATEDIFF_MINUTE(XML1.NGAY_VAO, XML1.NGAY_RA) == 0",
    "CANH_BAO": "⚠️ Nghi ngờ: Thời gian thực hiện lượt khám quá ngắn (0 phút), BHXH sẽ xuất toán.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_211",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_211",
    "TEN_QUY_TAC": "Ngày cấp GCT trùng ngày ra viện",
    "DIEU_KIEN": "XML1.MA_LYDO_VVIEN == '3' AND XML1.NGAY_GIAY_CHUYEN_TUYEN == XML1.NGAY_RA",
    "CANH_BAO": "⚠️ Kiểm tra: Giấy chuyển tuyến cấp trùng ngày ra viện tại nơi đi, cần đối soát giờ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_212",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_212",
    "TEN_QUY_TAC": "Điều trị nội trú thiếu mã giường",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB IN ('03', '09', '3', '9') AND COUNT_IF(XML3, MA_NHOM IN ('14', '15')) == 0",
    "CANH_BAO": "⛔ Lỗi hồ sơ: Nằm viện nội trú nhưng không phát sinh tiền giường bệnh.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_213",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_213",
    "TEN_QUY_TAC": "Số ngày điều trị > 90 ngày",
    "DIEU_KIEN": "XML1.SO_NGAY_DTRI > 90",
    "CANH_BAO": "⚠️ Cảnh báo: Đợt điều trị kéo dài bất thường (>6 tháng), yêu cầu biên bản hội chẩn.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_214",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_214",
    "TEN_QUY_TAC": "Mã bệnh chính dùng mã phụ (Asterisk)",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH ENDS_WITH '*'",
    "CANH_BAO": "⛔ Sai quy tắc: Mã bệnh chính (ICD-10) không được là mã có dấu hoa thị (*).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_215",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_215",
    "TEN_QUY_TAC": "Mã bệnh kèm theo trùng bệnh chính",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH == XML1.MA_BENH_KT",
    "CANH_BAO": "⚠️ Lãng phí: Mã bệnh kèm theo trùng lặp hoàn toàn với chẩn đoán chính.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_216",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_216",
    "TEN_QUY_TAC": "Dịch vụ kỹ thuật thiếu mã máy",
    "DIEU_KIEN": "COUNT_IF(XML3, MA_NHOM IN (2,3) AND IS_EMPTY(MA_MAY)) > 0",
    "CANH_BAO": "⛔ QĐ 130: XN và CDHA bắt buộc phải khai báo Mã máy thực hiện kỹ thuật.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_217",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_217",
    "TEN_QUY_TAC": "Sai mã kết quả điều trị (Tử vong)",
    "DIEU_KIEN": "XML1.KET_QUA_DTRI == '5' AND XML1.MA_LOAI_RV != '3'",
    "CANH_BAO": "⛔ Mâu thuẫn: Kết quả tử vong nhưng lý do ra viện không phải là tử vong (3).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_218",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_218",
    "TEN_QUY_TAC": "Tiền nguồn khác lớn hơn tổng chi",
    "DIEU_KIEN": "XML1.T_NGUONKHAC > XML1.T_TONGCHI_BV",
    "CANH_BAO": "⛔ Lỗi tài chính: Tiền từ nguồn hỗ trợ khác lớn hơn tổng chi phí hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_219",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_219",
    "TEN_QUY_TAC": "Sai lệch tiền DVKT (XML1 vs XML3)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi đồng bộ: Tổng tiền dịch vụ kỹ thuật không khớp giữa hai bảng dữ liệu.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: dùng SUM(collection.field) không tương thích engine; rule kế toán tương đương đã có bản SUM_IF an toàn hơn. Điều kiện gốc: ABS(XML1.T_DVKT - SUM(XML3.THANH_TIEN WHERE MA_NHOM NOT IN (10,14,15))) > 2"
  },
  {
    "id": "SEED_HANHCHINH_220",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_220",
    "TEN_QUY_TAC": "Tổng tiền thanh toán = 0",
    "DIEU_KIEN": "XML1.T_TONGCHI_BH == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Hồ sơ có lượt khám nhưng tổng chi phí bằng 0.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_221",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_221",
    "TEN_QUY_TAC": "Tỷ lệ thanh toán BHYT sai (Dưới 1%)",
    "DIEU_KIEN": "XML1.T_BHTT > 0 AND XML1.T_BHTT < (XML1.T_TONGCHI_BH * 0.01)",
    "CANH_BAO": "⚠️ Kiểm tra: Tỷ lệ bảo hiểm chi trả quá thấp, cần rà soát lại mức hưởng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_222",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_222",
    "TEN_QUY_TAC": "Mã bác sĩ chứa ký tự đặc biệt",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Mã CCHN bác sĩ chứa khoảng trắng hoặc ký tự lạ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_223",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_223",
    "TEN_QUY_TAC": "Ngày ký điện tử sau ngày gửi hồ sơ",
    "DIEU_KIEN": "XML1.NGAY_TTOAN > GET_SERVER_DATE()",
    "CANH_BAO": "⛔ Lỗi hệ thống: Thời điểm ký số nằm ở tương lai (Sai lệch clock server).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_224",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_224",
    "TEN_QUY_TAC": "Bác sĩ mổ trùng bác sĩ phụ mổ",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Audit: Một người không thể vừa là phẫu thuật viên chính vừa là phụ mổ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_225",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_225",
    "TEN_QUY_TAC": "Số CCCD trùng với người khác",
    "DIEU_KIEN": "COUNT_DISTINCT(XML1.MA_BN) > 1 WHERE SO_CCCD == Current",
    "CANH_BAO": "❌ CẢNH BÁO ĐỎ: Một số CCCD đang được dùng cho nhiều Mã bệnh nhân khác nhau.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_226",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_226",
    "TEN_QUY_TAC": "Trẻ em dùng mã định danh sai cấu trúc",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Đề án 06: Mã định danh cá nhân của trẻ phải đủ 12 số.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: (FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) < 6)AND LEN(XML1.SO_CCCD) != 12"
  },
  {
    "id": "SEED_HANHCHINH_227",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_227",
    "TEN_QUY_TAC": "Thiếu ảnh chân dung xác thực VNeID",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI MCI: Xác thực qua VNeID mức 2 nên lưu vết ảnh/mã xác thực vào hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu EXT.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: EXT.HINH_THUC_THE == 'VNEID' AND IS_EMPTY(EXT.URL_ANH)"
  },
  {
    "id": "SEED_HANHCHINH_228",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_228",
    "TEN_QUY_TAC": "BN trên 80 tuổi thiếu đối tượng ưu tiên",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Thông tin: BN trên 80 tuổi, kiểm tra quyền lợi chuyển đổi sang đối tượng ưu tiên.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc thời điểm chạy hiện tại, gây sai lệch với hồ sơ lịch sử production. Điều kiện gốc: FLOOR(DATEDIFF(day, TO_DATE(SUBSTRING(XML1.NGAY_SINH,1,8), 'YYYYMMDD'), GETDATE()) / 365.25) >= 80 AND XML1.MA_THE_BHYT NOT STARTS_WITH 'BT'"
  },
  {
    "id": "SEED_HANHCHINH_229",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_229",
    "TEN_QUY_TAC": "Thiếu giấy chứng nhận phẫu thuật",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Pháp lý: Có phẫu thuật nhưng hồ sơ thiếu giấy chứng nhận phẫu thuật điện tử.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_230",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_230",
    "TEN_QUY_TAC": "Giấy hẹn tái khám quá 30 ngày",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_TAI_KHAM) AND DATEDIFF_DAY(XML1.NGAY_RA, XML1.NGAY_TAI_KHAM) > 30",
    "CANH_BAO": "⚠️ Cảnh báo: Ngày hẹn khám lại quá xa (>30 ngày), cần giải trình lâm sàng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_231",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_231",
    "TEN_QUY_TAC": "Thiếu thông tin người đỡ đẻ (Sản)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI Audit: Ca sinh đẻ thiếu thông tin định danh Nữ hộ sinh/Bác sĩ đỡ đẻ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_BENH_CHINH STARTS_WITH 'O8' AND IS_EMPTY(HIS.TEN_HO_SINH)"
  },
  {
    "id": "SEED_HANHCHINH_232",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_232",
    "TEN_QUY_TAC": "Giấy ra viện trùng số Seri",
    "DIEU_KIEN": "COUNT_DISTINCT(XML1.MA_LK) > 1 WHERE SO_SERI_GRV == Current",
    "CANH_BAO": "❌ LỖI NGHIÊM TRỌNG: Trùng số Seri giấy ra viện giữa các lượt khám khác nhau.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_233",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_233",
    "TEN_QUY_TAC": "Hồ sơ có thuốc gây nghiện thiếu số đơn",
    "DIEU_KIEN": "COUNT_IF(XML2, NHOM == 'GAY_NGHIEN') > 0 AND IS_EMPTY(XML2.SO_DON)",
    "CANH_BAO": "⛔ Pháp lý: Thuốc gây nghiện bắt buộc phải gắn số đơn thuốc điện tử quốc gia.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_234",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_234",
    "TEN_QUY_TAC": "BN nội trú chưa đánh giá nguy cơ té ngã",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ JCI IPSG.6: Bệnh nhân nằm viện thiếu bảng điểm đánh giá nguy cơ té ngã.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu JCI.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: XML1.MA_LOAI_KCB == '3' AND IS_EMPTY(JCI.SCORE_TE_NGA)"
  },
  {
    "id": "SEED_HANHCHINH_235",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_235",
    "TEN_QUY_TAC": "Thiếu mã vùng thẻ (K1, K2, K3)",
    "DIEU_KIEN": "XML1.MA_DOITUONG IN (\"K1\",\"K2\",\"K3\") AND XML1.MA_LOAI_KCB != \"01\" AND XML1.T_TONGCHI_BH > 0 AND XML1.T_BHTT < XML1.T_TONGCHI_BH",
    "CANH_BAO": "⚠️ Kiểm tra: BN hưởng 100% nhưng thiếu mã khu vực ưu tiên để đối soát.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_236",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_236",
    "TEN_QUY_TAC": "Tiền khám lần 2 cùng chuyên khoa",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Xuất toán: Không được tính 2 lần tiền khám cùng 1 chuyên khoa trong 1 ngày.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: toán tử không thuộc tập hàm an toàn đã chuẩn hóa của engine hiện tại. Điều kiện gốc: COUNT_IF(XML3, MA_DICH_VU == Current_DV) > 1 WITHIN(1_DAY)"
  },
  {
    "id": "SEED_HANHCHINH_237",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_237",
    "TEN_QUY_TAC": "Sai mã loại ra viện (Chuyển viện)",
    "DIEU_KIEN": "XML1.MA_NOI_DEN != '' AND XML1.MA_LOAI_RV != '2'",
    "CANH_BAO": "⛔ Mâu thuẫn: Có nơi chuyển đến nhưng lý do ra viện không phải là Chuyển tuyến.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_238",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_238",
    "TEN_QUY_TAC": "Bệnh nhân quốc tế thiếu tiền công khám riêng",
    "DIEU_KIEN": "XML1.MA_QUOCTICH NOT IN ('000', '704', 'VN', 'VNM') AND COUNT_IF(XML3, MA_NHOM == '13' AND TO_NUMBER(DON_GIA) < 200000) > 0",
    "CANH_BAO": "⚠️ Kinh tế: Bệnh nhân nước ngoài áp giá khám BHYT thường (Cần kiểm tra lại giá DV).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_239",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_239",
    "TEN_QUY_TAC": "Tên thẻ XML chứa ký tự tiếng Việt",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ Lỗi kỹ thuật: Tên các thẻ Tag XML không được chứa dấu tiếng Việt.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_240",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_240",
    "TEN_QUY_TAC": "Hồ sơ gửi lại thiếu mã lý do",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Cảnh báo: Hồ sơ gửi thay thế nhưng thiếu nội dung lý do chỉnh sửa.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu XML_HEADER.* ngoài dữ liệu nghiệp vụ XML chuẩn đang dùng. Điều kiện gốc: XML_HEADER.RE_SEND == 1 AND IS_EMPTY(XML_HEADER.REASON)"
  },
  {
    "id": "SEED_HANHCHINH_241",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_241",
    "TEN_QUY_TAC": "BN chết trước khi vào viện",
    "DIEU_KIEN": "NOT IS_EMPTY(XML1.NGAY_TU_VONG) AND XML1.NGAY_TU_VONG < XML1.NGAY_VAO",
    "CANH_BAO": "❌ LỖI LOGIC: Thời điểm tử vong xảy ra trước khi bệnh nhân nhập viện.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_242",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_242",
    "TEN_QUY_TAC": "Cân đối T_TONGCHI_BV với tổng các nguồn thanh toán",
    "DIEU_KIEN": "ABS(TO_NUMBER(XML1.T_TONGCHI_BV) - (TO_NUMBER(XML1.T_BHTT) + TO_NUMBER(XML1.T_BNTT) + TO_NUMBER(XML1.T_BNCCT) + TO_NUMBER(XML1.T_NGUONKHAC) + TO_NUMBER(XML1.T_NGOAIDS))) > 5",
    "CANH_BAO": "⛔ Lỗi kế toán: Tổng tiền (T_TONGCHI_BV) lệch quá 5 đồng so với tổng các nguồn thanh toán (BHYT + BN + CCT + Nguồn khác + Ngoài DS HIV/AIDS).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_243",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_243",
    "TEN_QUY_TAC": "Bác sĩ điều trị bị khóa tài khoản",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "❌ LỖI PHÁP LÝ: Bác sĩ đang bị đình chỉ hoặc khóa CCHN nhưng vẫn đứng tên hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: phụ thuộc danh mục nội bộ DM_BS_KHOA_CCHN, không thấy được nạp như nguồn chuẩn vào context engine hiện tại. Điều kiện gốc: XML1.MA_TTDV IN (DM_BS_KHOA_CCHN)"
  },
  {
    "id": "SEED_HANHCHINH_244",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "HC_244",
    "TEN_QUY_TAC": "Hồ sơ chưa qua bước kiểm soát nội bộ",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ Nhắc nhở: Hồ sơ chưa được bộ phận KHTH/Kiểm tra nội bộ duyệt.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx",
    "GHI_CHU_SUA": "✏️ [Production review] Vô hiệu hóa trước deploy: tham chiếu HIS.* ngoài schema XML/QĐ130-QĐ3176 và không có trong engine hiện tại. Điều kiện gốc: HIS.INTERNAL_CHECK == FALSE"
  },
  {
    "id": "SEED_HANHCHINH_245",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_245",
    "TEN_QUY_TAC": "Kiểm tra định dạng Người thực hiện (XML3)",
    "DIEU_KIEN": "NOT REGEX_MATCH(XML3.NGUOI_THUC_HIEN, '^[0-9]+/[A-Z]+-[A-Z]+$')",
    "CANH_BAO": "⛔ [SAI ĐỊNH DẠNG]: Mã Người thực hiện DVKT tại XML3 không khớp với định dạng CCHN/GPHN thực tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_246",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_246",
    "TEN_QUY_TAC": "Validate độ dài trường ngày QĐ 130",
    "DIEU_KIEN": "LEN(XML1.NGAY_VAO) != 12 OR LEN(XML1.NGAY_RA) != 12 OR (XML1.NGAY_SINH != '' AND LEN(XML1.NGAY_SINH) != 12)",
    "CANH_BAO": "⛔ [QĐ 130]: Trường ngày giờ phải đúng 12 ký tự theo chuẩn yyyyMMddHHmm (VD: 202311080000). Kiểm tra NGAY_VAO, NGAY_RA, NGAY_SINH.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_247",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_247",
    "TEN_QUY_TAC": "Validate tháng/ngày trong chuỗi ngày QĐ 130",
    "DIEU_KIEN": "SUBSTR(XML1.NGAY_VAO,5,2) NOT BETWEEN '01' AND '12' OR SUBSTR(XML1.NGAY_VAO,7,2) NOT BETWEEN '01' AND '31' OR SUBSTR(XML1.NGAY_RA,5,2) NOT BETWEEN '01' AND '12' OR SUBSTR(XML1.NGAY_RA,7,2) NOT BETWEEN '01' AND '31'",
    "CANH_BAO": "⛔ [QĐ 130]: Phần tháng (MM) phải từ 01-12, phần ngày (dd) phải từ 01-31 trong chuỗi yyyyMMddHHmm.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_248",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_248",
    "TEN_QUY_TAC": "Validate giờ/phút trong trường ngày QĐ 130",
    "DIEU_KIEN": "SUBSTR(XML1.NGAY_VAO,9,2) > '23' OR SUBSTR(XML1.NGAY_VAO,11,2) > '59' OR SUBSTR(XML1.NGAY_RA,9,2) > '23' OR SUBSTR(XML1.NGAY_RA,11,2) > '59'",
    "CANH_BAO": "⛔ [QĐ 130]: Phần giờ (HH) phải từ 00-23, phần phút (mm) phải từ 00-59 trong chuỗi yyyyMMddHHmm. Áp dụng cho NGAY_VAO và NGAY_RA.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_HANH_CHINH (7).xlsx"
  },
  {
    "id": "SEED_HANHCHINH_249",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_249",
    "TEN_QUY_TAC": "Cấp cứu: ICD và lý do/tình trạng theo danh mục ICD-10 cấp cứu (Nhi NH** / Người lớn NL**)",
    "DIEU_KIEN": "HC_249_BUILTIN_ICD10_CAP_CUU",
    "CANH_BAO": "⚠️ [ICD cấp cứu]: MA_LY_DO_VV=2 (cấp cứu) nhưng chưa đối chiếu được với danh mục nội bộ: (1) MA_BENH_CHINH phải khớp mã trích từ cột ICD_Chinh hoặc ICD_Kem_Theo của ít nhất một dòng đúng nhóm tuổi (mã dòng NH** cho trẻ dưới 16 tuổi, NL** từ 16 tuổi trở lên); (2) CHẨN ĐOÁN/ghi chú cần phản ánh ít nhất một phần nội dung Tinh_Trang_Benh hoặc Ly_Do_Nhap_Vien của cùng dòng đó. Cập nhật DM tại Quản lý danh mục → ICD10 cấp cứu nếu cần.",
    "NGUON_DU_LIEU": "giam_dinh_icd10_cap_cuu.jsx + DANH_MUC_ICD10_CAP_CUU"
  },
  {
    "id": "SEED_HANHCHINH_250",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_250",
    "TEN_QUY_TAC": "Thẻ BHYT: 2 ký tự đầu không khớp nhóm theo ký hiệu số thứ 3 (nghi ngờ sai thẻ/khai báo)",
    "DIEU_KIEN": "VI_PHAM_KHAI_BAO_THE_SO3_LECH_PREFIX(XML1)",
    "CANH_BAO": "⚠️ [Thẻ BHYT]: Hai ký tự đầu MA_THE_BHYT không thuộc nhóm đối tượng thông thường của ký tự thứ 3 in trên thẻ (bảng nội bộ QĐ 1018, bổ sung nhóm CN/LH mức 2 theo CV 38/BYT-BH). Kiểm tra thẻ cứng/BHXH hoặc nhập lại mã thẻ — không dùng kết quả này một mình để kết luận sai tỷ lệ T_BHTT.",
    "NGUON_DU_LIEU": "dong_co_giam_dinh.jsx (BANG_HAI_KY_TU_THEO_KY_HIEU_SO3)"
  },
  {
    "id": "SEED_HANHCHINH_251",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_251",
    "TEN_QUY_TAC": "Người cao tuổi LH (trợ cấp hưu trí XH) — tỷ lệ phạm vi theo thẻ (NQ 261/2025; CV 38/BYT-BH)",
    "DIEU_KIEN": "XML1.MA_THE_BHYT STARTS_WITH 'LH' AND VI_PHAM_TYLE_T_BHTT_TONGCHI_BH(XML1)",
    "CANH_BAO": "⛔ [LH / mức quyền lợi]: Từ 01/01/2026 theo NQ 261/2025/QH15 và Công văn 38/BYT-BH (06/01/2026), đối tượng LH được chuyển mã quyền lợi từ 4 (80%) sang 2 (100%) trong phạm vi chi trả; engine suy tỷ lệ theo `KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT` (kể cả khi ký tự thứ 3 trên XML còn 4). Trước 01/01/2026 vẫn theo QĐ 1018 — mức 4 → 80%. T_BHTT chưa khớp tỷ lệ so với T_TONGCHI_BH.",
    "NGUON_DU_LIEU": "dong_co_giam_dinh.jsx (KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT) + Công văn 38/BYT-BH"
  },
  {
    "id": "SEED_HANHCHINH_302",
    "TRANG_THAI": "ON",
    "MA_LUAT": "HC_302",
    "TEN_QUY_TAC": "Mở rộng quyền lợi tự đến KCB ngoại trú 50% (CV 302)",
    "DIEU_KIEN": "SUBSTR(XML1.NGAY_VAO, 1, 8) >= '20260701' AND XML1.MA_DOITUONG_KCB IN ('1.13', '1.14', '1.18') AND XML1.T_BHTT <= 0 AND XML1.T_TONGCHI_BH > 0",
    "CANH_BAO": "⚠️ [CV 302]: Từ 01/7/2026, mã đối tượng KCB tự đến ngoại trú (1.13/1.14/1.18) được hưởng 50% phạm vi với bệnh ngoài Phụ lục 02/01 TT 01/2025 — hồ sơ có chi phí BHYT nhưng T_BHTT = 0, rà soát mức hưởng/MUC_HUONG.",
    "NGUON_DU_LIEU": "Công văn CV 302/CSYT-CĐ + PL10 BYT"
  }
];
