/** AUTO-GENERATED from DuLieu_LUAT_THUOC (9).xlsx */
export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '2026-06-15_canh_bao_gon';
export const COT_SEED_LUAT_THUOC_MUC8 = ["TRANG_THAI","MA_LUAT","TEN_QUY_TAC","DIEU_KIEN","CANH_BAO","GHI_CHU","NGUON_DU_LIEU"];
export const DU_LIEU_SEED_LUAT_THUOC_MUC8 = [
  {
    "id": "SEED_THUOC_1",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_01",
    "TEN_QUY_TAC": "[Acetyl leucin] Cảnh báo liều tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.685' AND TONG_LIEU_24H > 2000",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Liều Acetyl Leucin (Gikanin) tối đa là 2000mg/ngày (tương đương 4 viên 500mg).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_2",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_02",
    "TEN_QUY_TAC": "[Acetyl leucin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.685' AND (XML1.MA_BENH_CHINH IN ('O21') OR XML1.MA_BENH_KT REGEXP 'O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_3",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_03",
    "TEN_QUY_TAC": "[Acetyl leucin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.685' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(CHÓNG MẶT|RỐI LOẠN TIỀN ĐÌNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Acetyl leucin] — ICD/XML1 không khớp chỉ định. Chỉ định: Gikanin — Chóng mặt (H81, R42).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_4",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_04",
    "TEN_QUY_TAC": "[Aciclovir] Cảnh báo liều tuyệt đối/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.260' AND TONG_LIEU_24H > 4000",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Aciclovir (> 4000mg/ngày). Tăng nguy cơ kết tủa thuốc trong ống thận gây suy thận cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_5",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_05",
    "TEN_QUY_TAC": "[Aciclovir] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.260' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_6",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_06",
    "TEN_QUY_TAC": "[Aciclovir] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.260' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HERPES|NHIỄM HERPES|ZONA)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Aciclovir] — ICD/XML1 không khớp chỉ định. Chỉ định: Acyclovir — nhiễm Herpes (B00) hoặc Zona (B02).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_7",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_07",
    "TEN_QUY_TAC": "[Aciclovir] Kiểm tra tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.260' AND TAN_SUAT > 5",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Aciclovir đường uống dùng tối đa 5 lần/ngày (điều trị Herpes/Zona). Kê > 5 lần là sai hướng dẫn sử dụng thuốc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_8",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_08",
    "TEN_QUY_TAC": "[Adrenalin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.86' AND (XML1.MA_BENH_CHINH IN ('I10', 'I20', 'I47') OR XML1.MA_BENH_KT REGEXP 'I10|I20|I47')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định tương đối ở bệnh nhân Tăng huyết áp, Đau thắt ngực (I10, I20, I47).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_9",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_09",
    "TEN_QUY_TAC": "[Adrenalin] Kiểm soát cấp cứu",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.86' AND XML2.SO_LUONG > 10",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Số lượng Adrenalin sử dụng cao (> 10 ống). Yêu cầu xác nhận diễn biến bệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_10",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_10",
    "TEN_QUY_TAC": "[Adrenalin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.86' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(CHẢY MÁU SAU THỦ THUẬT|SỐC|NGỪNG TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Adrenalin] — ICD/XML1 không khớp chỉ định. Chỉ định: Adrenalin — cấp cứu Sốc phản vệ, Ngưng tim (T81.1, R57, I46).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_11",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_11",
    "TEN_QUY_TAC": "[Albendazol] Cảnh báo liều nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.145' AND XML1.CAN_NANG < 10 AND TONG_LIEU_1_LAN > 200",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Trẻ em < 10kg chỉ dùng tối đa 200mg Albendazol/lần. Y lệnh 400mg là quá liều.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_12",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_12",
    "TEN_QUY_TAC": "[Albendazol] Kiểm tra số lượng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.145' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc tẩy giun cấp dư. Kiểm tra lại liều duy nhất hoặc liều 3 ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_13",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_13",
    "TEN_QUY_TAC": "[Alfuzosin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.412' AND (XML1.MA_BENH_CHINH IN ('K72', 'I95.1') OR XML1.MA_BENH_KT REGEXP 'K72|I95\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan (K72) hoặc Có tiền sử Hạ huyết áp tư thế (I95.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_14",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_14",
    "TEN_QUY_TAC": "[Alfuzosin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.412' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(PHÌ ĐẠI TUYẾN TIỀN LIỆT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Alfuzosin] — ICD/XML1 không khớp chỉ định. Chỉ định: Alanboss XL 10 — Phì đại tuyến tiền liệt lành tính (N40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_15",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_15",
    "TEN_QUY_TAC": "[Alfuzosin] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.412' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Alanboss XL 10mg là dạng phóng thích kéo dài, chỉ dùng 1 lần duy nhất sau ăn.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_16",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_16",
    "TEN_QUY_TAC": "[Alimemazin tartrat] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.987' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'K72') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan/thận nặng (N18.4, K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_17",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_17",
    "TEN_QUY_TAC": "[Alimemazin tartrat] Kiểm tra Chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.987' AND XML1.MA_BENH_CHINH NOT IN ('J30', 'L50', 'R05') AND XML1.MA_BENH_KT NOT LIKE '%J30%' AND XML1.MA_BENH_KT NOT LIKE '%L50%' AND XML1.MA_BENH_KT NOT LIKE '%R05%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM MŨI DỊ ỨNG|MÀY ĐAY|HO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Atilene chỉ được thanh toán cho Dị ứng, Mày đay, Ho (J30, L50, R05).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_18",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_18",
    "TEN_QUY_TAC": "[Alimemazin] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.987' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng siro/viên Atilene kê đơn không khớp với hướng dẫn chi tiết.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_19",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_19",
    "TEN_QUY_TAC": "[Allopurinol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.59' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'K72') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4) hoặc Suy gan nặng (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_20",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_20",
    "TEN_QUY_TAC": "[Allopurinol] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.59' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc điều trị Gout cấp phát dư so với y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_21",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_21",
    "TEN_QUY_TAC": "[Allopurinol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.59' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(GÚT|GOUT|BỆNH GÚT|SỎI THẬN)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Allopurinol] — ICD/XML1 không khớp chỉ định. Chỉ định: Agigout 300 — Gout mãn tính (M10) hoặc Sỏi thận Acid Uric (N20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_22",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_22",
    "TEN_QUY_TAC": "[Ambroxol 30mg] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.988' AND XML2.DON_VI_TINH LIKE '%Viên%' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Ambroxol viên dùng tối đa 3 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_23",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_23",
    "TEN_QUY_TAC": "[Ambroxol Chai] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.988' AND XML2.DON_VI_TINH LIKE '%Chai%' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Siro ho thường dùng tối đa 3 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_24",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_24",
    "TEN_QUY_TAC": "[Ambroxol HCl] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.988' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26') OR XML1.MA_BENH_KT REGEXP 'K25|K26')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày tiến triển (K25, K26).",
    "GHI_CHU": "Đã gộp dòng trùng [Ambroxol] Chống chỉ định (cùng MA_LUAT + DIEU_KIEN)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_25",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_25",
    "TEN_QUY_TAC": "[Ambroxol HCl] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.988' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM ĐƯỜNG HÔ HẤP TRÊN|VIÊM HỌNG|NHIỄM TRÙNG HÔ HẤP|VIÊM PHẾ QUẢN|HO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Ambroxol HCl] — ICD/XML1 không khớp chỉ định. Chỉ định: Ambroxol — Viêm hô hấp (J06, J20) hoặc Ho (R05).",
    "GHI_CHU": "Đã gộp dòng trùng [Ambroxol] Kiểm tra ICD-10 (cùng MA_LUAT + DIEU_KIEN)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_26",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_26",
    "TEN_QUY_TAC": "[Amcoda] Tần suất nạp/duy trì",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.483' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Amiodaron dùng tần suất cao. Cần theo dõi QT trên điện tâm đồ liên tục.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_27",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_27",
    "TEN_QUY_TAC": "[Amiodaron] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.483' AND (XML1.MA_BENH_CHINH IN ('I44.2', 'I44.3', 'E05', 'R00.1') OR XML1.MA_BENH_KT REGEXP 'I44\\.2|I44\\.3|E05|R00\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Block AV độ 2-3 (I44), Cường giáp (E05), Nhịp chậm (R00.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_28",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_28",
    "TEN_QUY_TAC": "[Amiodaron] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.483' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NHỊP NHANH KỊCH PHÁT|LOẠN NHỊP|RUNG NHĨ|CUỒNG NHĨ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amiodaron] — ICD/XML1 không khớp chỉ định. Chỉ định: BFS - Amiron — Rối loạn nhịp nhanh (I47, I48).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_29",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_29",
    "TEN_QUY_TAC": "[Amitriptylin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.961' AND (XML1.MA_BENH_CHINH IN ('I21', 'I44.2', 'I44.3', 'G40') OR XML1.MA_BENH_KT REGEXP 'I21|I44\\.2|I44\\.3|G40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân NMCT cấp (I21), Block tim (I44), Tiền sử Động kinh (G40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_30",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_30",
    "TEN_QUY_TAC": "[Amitriptylin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.961' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TRẦM CẢM|ĐAU MẠN TÍNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amitriptylin] — ICD/XML1 không khớp chỉ định. Chỉ định: Amitriptylin — Trầm cảm (F32) hoặc Đau nguồn gốc thần kinh (R52.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_31",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_31",
    "TEN_QUY_TAC": "[Amitriptylin] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.961' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Amitriptylin có tác dụng an thần mạnh, thường dùng 1 lần duy nhất vào buổi tối.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_32",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_32",
    "TEN_QUY_TAC": "[Amlodipin + valsartan] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.501' AND (XML1.MA_BENH_CHINH IN ('O21', 'N18.4', 'N18.5', 'K72') OR XML1.MA_BENH_KT REGEXP 'O21|N18\\.4|N18\\.5|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Phụ nữ có thai (O21), Suy thận nặng (N18.4, N18.5) hoặc Suy gan nặng (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_33",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_33",
    "TEN_QUY_TAC": "[Amlodipin + valsartan] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.501' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amlodipin + valsartan] — ICD/XML1 không khớp chỉ định. Chỉ định: Wamlox 5mg/80mg — Tăng huyết áp vô căn (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_34",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_34",
    "TEN_QUY_TAC": "[Amlodipin + Valsartan] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.501' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Wamlox (Amlodipin/Valsartan) chỉ định dùng duy nhất 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_35",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_35",
    "TEN_QUY_TAC": "[Amlodipin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.491' AND (XML1.MA_BENH_CHINH IN ('I95.1', 'O21') OR XML1.MA_BENH_KT REGEXP 'I95\\.1|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hạ huyết áp (I95.1) hoặc Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_36",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_36",
    "TEN_QUY_TAC": "[Amlodipin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.491' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amlodipin] — ICD/XML1 không khớp chỉ định. Chỉ định: Amlodipine Stella 10 mg — Tăng huyết áp (I10) hoặc Đau thắt ngực (I20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_37",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_37",
    "TEN_QUY_TAC": "[Amlodipine + Lisinopril] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.497' AND (XML1.MA_BENH_CHINH IN ('O21', 'N18.4', 'N18.5', 'I95.1', 'K72') OR XML1.MA_BENH_KT REGEXP 'O21|N18\\.4|N18\\.5|I95\\.1|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Phụ nữ có thai (O21), Suy thận/gan nặng (N18.4, N18.5, K72), Hạ huyết áp (I95.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_38",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_38",
    "TEN_QUY_TAC": "[Amlodipine + Lisinopril] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.497' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amlodipine + Lisinopril] — ICD/XML1 không khớp chỉ định. Chỉ định: Lisonorm — Tăng huyết áp vô căn (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_39",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_39",
    "TEN_QUY_TAC": "[Amlodipine] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.491' AND (CALC_SL_MOI_NGAY * 10) > 10",
    "CANH_BAO": "⛔ [SAI LIỀU]: Amlodipin tối đa 10mg/ngày. Tăng liều gây phù chân nặng và tụt huyết áp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_40",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_40",
    "TEN_QUY_TAC": "[Amoxicilin + acid clavulanic] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.155' AND (XML1.MA_BENH_CHINH IN ('Z88.0', 'K71') OR XML1.MA_BENH_KT REGEXP 'Z88\\.0|K71')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Dị ứng Penicillin (Z88.0) hoặc Bệnh gan do thuốc (K71).",
    "GHI_CHU": "Đã gộp dòng trùng [Amoxicilin+Acid clavulanic] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_41",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_41",
    "TEN_QUY_TAC": "[Amoxicillin + clavulanat] Chỉ định nhiễm khuẩn (40.155)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.155' AND THUOC_41_VI_PHAM_CHI_DINH(XML1, XML2)",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH / THỜI GIAN]: Amoxicillin + acid clavulanic (40.155) — dùng ngắn ngày (thường dưới 14 ngày) cho nhiễm khuẩn do chủng beta-lactamase không đáp ứng aminopenicilin đơn độc: HK trên nặng (viêm amidan/xoang/tai giữa…), HK dưới (viêm phế quản/phổi, H. influenzae/Moraxella…), tiết niệu–sinh dục (viêm bàng quang, niệu đạo, bể thận…), da/mô mềm, tủy xương, áp xe răng, nhiễm sau sảy thai/sản/ổ bụng… Cảnh báo khi ICD/chẩn đoán không khớp hoặc SO_NGAY > 14.",
    "GHI_CHU": "Viết lại theo hướng dẫn dùng chế phẩm; không gắn tên biệt dược.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_42",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_42",
    "TEN_QUY_TAC": "[Amoxicilin + Clavulanic] Liều tối đa nhi",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.155' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Amoxicillin (> 90mg/kg/ngày). Tăng nguy cơ tiêu chảy nặng và tổn thương gan do Acid Clavulanic.",
    "GHI_CHU": "Đã gộp dòng trùng [Amoxicillin/Clavulanate] Liều/24h",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_43",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_43",
    "TEN_QUY_TAC": "[Amoxicillin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.154' AND (XML1.MA_BENH_CHINH IN ('Z88.0') OR XML1.MA_BENH_KT REGEXP 'Z88\\.0')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử dị ứng Penicillin (Z88.0).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_44",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_44",
    "TEN_QUY_TAC": "[Amoxicillin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.154' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM AMIDAN|VIÊM HỌNG|VIÊM ĐƯỜNG HÔ HẤP TRÊN|NHIỄM TRÙNG HÔ HẤP|VIÊM PHỔI|VIÊM PHẾ QUẢN|VIÊM TỦY RĂNG|ÁP XE RĂNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Amoxicillin] — ICD/XML1 không khớp chỉ định. Chỉ định: Moxacin 500 mg — Nhiễm khuẩn hô hấp (J01-J20) hoặc Viêm tủy răng (K04).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_45",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_45",
    "TEN_QUY_TAC": "[Amoxicillin] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.154' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng Amoxicillin 500mg kê đơn và y lệnh chi tiết không khớp nhau.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_46",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_46",
    "TEN_QUY_TAC": "[Antacid] Kiểm tra tần suất phối hợp",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.671' AND TAN_SUAT > 4",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Alumag-S dùng tối đa 4 lần/ngày (1-3h sau ăn và lúc đi ngủ).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_47",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_47",
    "TEN_QUY_TAC": "[Atorvastatin + ezetimibe] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.567' AND (XML1.MA_BENH_CHINH IN ('K71', 'K72', 'O21', 'O92') OR XML1.MA_BENH_KT REGEXP 'K71|K72|O21|O92')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Bệnh gan tiến triển (K71, K72), Phụ nữ có thai hoặc cho con bú (O21, O92).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_48",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_48",
    "TEN_QUY_TAC": "[Atorvastatin + ezetimibe] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.567' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG CHOLESTEROL|RỐI LOẠN LIPID|TĂNG TRIGLYCERID|TĂNG LIPID MÁU HỖN HỢP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Atorvastatin + ezetimibe] — ICD/XML1 không khớp chỉ định. Chỉ định: Atovze 40/10 — Rối loạn Lipoprotein máu (E78.0, E78.1, E78.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_49",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_49",
    "TEN_QUY_TAC": "[Atorvastatin + Ezetimibe] Tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.567' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Atovze 40/10 chỉ dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_50",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_50",
    "TEN_QUY_TAC": "[Atorvastatin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.549' AND (XML1.MA_BENH_CHINH IN ('K71', 'K72', 'O21') OR XML1.MA_BENH_KT REGEXP 'K71|K72|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Viêm gan cấp (K71), Suy gan nặng (K72), Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_51",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_51",
    "TEN_QUY_TAC": "[Atorvastatin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.549' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG CHOLESTEROL|RỐI LOẠN LIPID|TĂNG TRIGLYCERID|TĂNG LIPID MÁU HỖN HỢP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Atorvastatin] — ICD/XML1 không khớp chỉ định. Chỉ định: Dorotor 20mg — Rối loạn Lipoprotein máu (E78.0, E78.1, E78.2...).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_52",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_52",
    "TEN_QUY_TAC": "[Atorvastatin] Tần suất Statin",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.549' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Atorvastatin 20mg chỉ dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_53",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_53",
    "TEN_QUY_TAC": "[Atropin sulfat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.96' AND (XML1.MA_BENH_CHINH IN ('K56', 'N40', 'H40') OR XML1.MA_BENH_KT REGEXP 'K56|N40|H40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho Liệt ruột (K56), Phì đại tuyến tiền liệt (N40), Glaucom (H40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_54",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_54",
    "TEN_QUY_TAC": "[Atropin sulfat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.96' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NHỊP TIM CHẬM|NGỘ ĐỘC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Atropin sulfat] — ICD/XML1 không khớp chỉ định. Chỉ định: Atropin — Nhịp chậm xoang (R00.1) hoặc Ngộ độc (T60).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_55",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_55",
    "TEN_QUY_TAC": "[Atropin] Tần suất nhịp chậm",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.96' AND CALC_TAN_SUAT > 8",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Tần suất dùng Atropin cực cao. Kiểm tra nguy cơ ngộ độc Atropin (đỏ mặt, mê sảng).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_56",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_56",
    "TEN_QUY_TAC": "[Azithromycin] Cảnh báo liều nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 10",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Azithromycin cho trẻ em (> 10mg/kg/ngày). Kiểm tra lại y lệnh.",
    "GHI_CHU": "Đã gộp dòng trùng [Azithromycin] liều trẻ em",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_57",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_57",
    "TEN_QUY_TAC": "[Azithromycin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND (XML1.MA_BENH_CHINH IN ('K72', 'Z88.2') OR XML1.MA_BENH_KT REGEXP 'K72|Z88\\.2')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan nặng (K72) hoặc Dị ứng Macrolid (Z88.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_58",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_58",
    "TEN_QUY_TAC": "[Azithromycin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM AMIDAN|VIÊM HỌNG|VIÊM PHỔI|VIÊM PHẾ QUẢN|CHLAMYDIA|VIÊM TAI GIỮA|CHỐC|NHIỄM TRÙNG DA|ÁP XE DA|NHỌT|VIÊM MÔ TẾ BÀO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Azithromycin] — ICD/XML1 không khớp chỉ định. Chỉ định: Zaromax 500 — Nhiễm khuẩn hô hấp (J01, J03, J15, J20) hoặc Chlamydia (A56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_59",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_59",
    "TEN_QUY_TAC": "[Azithromycin] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Azithromycin (Zaromax 500) tích lũy trong mô rất lâu, bắt buộc chỉ dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_60",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_60",
    "TEN_QUY_TAC": "[Bacillus clausii] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.719' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_61",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_61",
    "TEN_QUY_TAC": "[Bacillus clausii] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.719' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TIÊU CHẢY|RỐI LOẠN NHU ĐỘNG RUỘT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Bacillus clausii] — ICD/XML1 không khớp chỉ định. Chỉ định: Enterogolds — Tiêu chảy (A09), Loạn khuẩn ruột (K59.1, R19.7).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_62",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_62",
    "TEN_QUY_TAC": "[Bacillus subtilis] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.718' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_63",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_63",
    "TEN_QUY_TAC": "[Bacillus subtilis] Tiêu chảy, viêm ruột, rối loạn tiêu hóa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.718' AND ENGINE_RULE_THUOC_63",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Bacillus subtilis (DOMUVAR) phù hợp khi điều trị tiêu chảy; viêm ruột cấp/mạn; rối loạn tiêu hóa; đi ngoài phân lỏng / bất thường (vd. A04–A09, K50–K52, K58, K59.1, K30, R19.5/R19.7…). Kiểm tra ICD/chẩn đoán — không dùng chỉ định tắc ruột (K56, xem THUOC_62).",
    "GHI_CHU": "Engine: THUOC_63 — coChiDinhHopLeBacillusSubtilis63. THUOC_62 chống chỉ định K56.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_64",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_64",
    "TEN_QUY_TAC": "[Basaglar] Tần suất Insulin nền",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.806' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Insulin Glargine là insulin nền tác dụng 24h, chỉ tiêm 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_65",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_65",
    "TEN_QUY_TAC": "[Betahistin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.899' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'J45') OR XML1.MA_BENH_KT REGEXP 'K25|K26|J45')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày tiến triển (K25, K26) hoặc Hen phế quản (J45).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_66",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_66",
    "TEN_QUY_TAC": "[Betahistin] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.899' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc điều trị chóng mặt cấp dư so với y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_67",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_67",
    "TEN_QUY_TAC": "[Betahistin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.899' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(CHÓNG MẶT|RỐI LOẠN TIỀN ĐÌNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Betahistin] — ICD/XML1 không khớp chỉ định. Chỉ định: Betahistin — Rối loạn tiền đình, Chóng mặt (H81).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_68",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_68",
    "TEN_QUY_TAC": "[Bismuth] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.664' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc điều trị dạ dày BISNOL cấp phát dư so với phác đồ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_69",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_69",
    "TEN_QUY_TAC": "[Bisoprolol] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.493' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Bisoprolol có T1/2 dài, chỉ sử dụng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_70",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_70",
    "TEN_QUY_TAC": "[Brocizin 20] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.698' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp phát dư thuốc chống co thắt so với y lệnh điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_71",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_71",
    "TEN_QUY_TAC": "[Bromhexin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.989' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26') OR XML1.MA_BENH_KT REGEXP 'K25|K26')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày tiến triển (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_72",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_72",
    "TEN_QUY_TAC": "[Bromhexin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.989' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM PHẾ QUẢN|HO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Bromhexin] — ICD/XML1 không khớp chỉ định. Chỉ định: Novahexin 8 — Viêm phế quản (J20) hoặc Ho đờm (R05).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_73",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_73",
    "TEN_QUY_TAC": "[Bromhexin] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.989' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng thuốc long đờm kê đơn không tương thích với hướng dẫn LIEU_DUNG.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_74",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_74",
    "TEN_QUY_TAC": "[Budesonid + Formoterol] Kiểm tra duy trì",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.762' AND TAN_SUAT > 2 AND XML1.MA_BENH_CHINH NOT IN ('J45') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HEN|HEN SUYỄN|HEN PHẾ QUẢN)'",
    "CANH_BAO": "⚠️ [KIỂM TRA LÂM SÀNG]: Symbicort dùng duy trì tối đa 2 lần/ngày. Tần suất > 2 lần chỉ dành cho liệu pháp cắt cơn (SMART) ở bệnh nhân Hen.",
    "GHI_CHU": "Quy tắc này chỉ xử lý tần suất Symbicort (40.762), không phải chỉ định Seretide. Chỉ định ICS/LABA: Seretide (40.982) = THUOC_338; Symbicort = THUOC_76.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_75",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_75",
    "TEN_QUY_TAC": "[Budesonid, Formoterol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.762' AND (XML1.MA_BENH_CHINH IN ('I47', 'I48') OR XML1.MA_BENH_KT REGEXP 'I47|I48')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có Rối loạn nhịp tim nhanh (I47, I48).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_76",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_76",
    "TEN_QUY_TAC": "[Budesonid, Formoterol] Kiểm tra chỉ định (hen J45 từ 4 tuổi, COPD J44)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.762' AND ENGINE_RULE_THUOC_76",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Budesonid + Formoterol (Symbicort) chỉ phù hợp điều trị duy trì hen phế quản (J45, từ 4 tuổi) hoặc COPD (J44), theo ICD-10 hoặc chẩn đoán tương đương.",
    "GHI_CHU": "Kiểm tra theo động cơ: coChiDinhHopLeIcsLabaJ45J44 (dong_co_giam_dinh.jsx).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_77",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_77",
    "TEN_QUY_TAC": "[Calci carbonat + vitamin D3] Chống CĐ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1033' AND (XML1.MA_BENH_CHINH IN ('E83.5', 'N20') OR XML1.MA_BENH_KT REGEXP 'E83\\.5|N20')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tăng Calci huyết (E83.5), Sỏi thận (N20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_78",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_78",
    "TEN_QUY_TAC": "[Calci carbonat + vitamin D3] Kiểm tra",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1033' AND XML1.MA_BENH_CHINH NOT IN ('E55', 'M81', 'O25') AND XML1.MA_BENH_KT NOT LIKE '%E55%' AND XML1.MA_BENH_KT NOT LIKE '%M81%' AND XML1.MA_BENH_KT NOT LIKE '%O25%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU VITAMIN D|LOÃNG XƯƠNG|SUY DINH DƯỠNG THAI KỲ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Caldihasan chỉ thanh toán cho Thiếu Calci (E55), Loãng xương (M81) hoặc Thai kỳ (O25).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_79",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_79",
    "TEN_QUY_TAC": "[Caldihasan] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1033' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư thuốc Calci + D3 so với y lệnh thực tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_80",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_80",
    "TEN_QUY_TAC": "[Carvedilol] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.497' AND TONG_LIEU_24H > 50 AND XML1.CAN_NANG < 85",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Carvedilol tối đa là 50mg/ngày đối với bệnh nhân < 85kg. Nguy cơ tụt huyết áp và nhịp chậm kịch phát.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_81",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_81",
    "TEN_QUY_TAC": "[Carvedilol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.497' AND (XML1.MA_BENH_CHINH IN ('J45', 'I44.1', 'I44.2', 'R00.1', 'K72') OR XML1.MA_BENH_KT REGEXP 'J45|I44\\.1|I44\\.2|R00\\.1|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho bệnh nhân Hen phế quản (J45), Block tim/Nhịp chậm (I44, R00.1), Suy gan (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_82",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_82",
    "TEN_QUY_TAC": "[Carvedilol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.497' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC|SUY TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Carvedilol] — ICD/XML1 không khớp chỉ định. Chỉ định: CarlolAPC 12.5 — Tăng huyết áp (I10), Đau thắt ngực (I20) hoặc Suy tim (I50).",
    "GHI_CHU": "Đã gộp dòng trùng [Carvedilol] ICD-10 (2 dòng cùng thuốc khác tên)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_83",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_83",
    "TEN_QUY_TAC": "[Carvedilol] Tần suất an toàn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.497' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Carvedilol thường dùng tối đa 2 lần/ngày để tránh tụt huyết áp kịch phát.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_84",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_84",
    "TEN_QUY_TAC": "[Cefazolin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.166' AND (XML1.MA_BENH_CHINH IN ('Z88.1') OR XML1.MA_BENH_KT REGEXP 'Z88\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Dị ứng Cephalosporin (Z88.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_85",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_85",
    "TEN_QUY_TAC": "[Cefazolin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.166' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM PHỔI|CHỐC|NHIỄM TRÙNG DA|VIÊM XƯƠNG TỦY|DỰ PHÒNG NHIỄM TRÙNG|DỰ PHÒNG PHẪU THUẬT|DỰ PHÒNG THỦ THUẬT)' AND XML1.CHAN_DOAN_VAO NOT REGEXP '(?i)(VIÊM PHỔI|CHỐC|NHIỄM TRÙNG DA|VIÊM XƯƠNG TỦY|DỰ PHÒNG NHIỄM TRÙNG|DỰ PHÒNG PHẪU THUẬT|DỰ PHÒNG THỦ THUẬT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Cefazolin] — ICD/XML1 không khớp chỉ định (kể cả ngoại lệ). Chỉ định: Zolifast 2000 — nhiễm khuẩn hô hấp (J15), da (L01), xương (M86) hoặc dự phòng phẫu thuật/thủ thuật (Z29.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_86",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_86",
    "TEN_QUY_TAC": "[Cefdinir] Cảnh báo liều tối đa người lớn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.167' AND TONG_LIEU_24H > 600",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Cefdinir tối đa không được vượt quá 600mg/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_87",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_87",
    "TEN_QUY_TAC": "[Cefdinir] Cảnh báo liều tối đa nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.167' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 14",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Cefdinir trẻ em (> 14mg/kg/ngày). Tăng nguy cơ tiêu chảy và kháng thuốc.",
    "GHI_CHU": "Đã gộp dòng trùng [Cefdinir] Quá liều/24h",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_88",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_88",
    "TEN_QUY_TAC": "[Cefdinir] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.167' AND (XML1.MA_BENH_CHINH IN ('Z88.1') OR XML1.MA_BENH_KT REGEXP 'Z88\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Dị ứng Cephalosporin (Z88.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_89",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_89",
    "TEN_QUY_TAC": "[Cefdinir] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.167' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM AMIDAN|VIÊM HỌNG|VIÊM PHỔI|VIÊM PHẾ QUẢN|CHỐC|NHIỄM TRÙNG DA)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Cefdinir] — ICD/XML1 không khớp chỉ định. Chỉ định: Osvimec 300 / Cefdinir 125 — Nhiễm khuẩn hô hấp (J01-J20) hoặc Nhiễm khuẩn da (L01).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_90",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_90",
    "TEN_QUY_TAC": "[Cefixim] Cảnh báo liều nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.169' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 8",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Cefixim trẻ em (> 8mg/kg/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_91",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_91",
    "TEN_QUY_TAC": "[Cefixim] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.169' AND (XML1.MA_BENH_CHINH IN ('Z88.1') OR XML1.MA_BENH_KT REGEXP 'Z88\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Dị ứng Cephalosporin (Z88.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_92",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_92",
    "TEN_QUY_TAC": "[Cefixim] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.169' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM AMIDAN|VIÊM HỌNG|VIÊM ĐƯỜNG HÔ HẤP TRÊN|NHIỄM TRÙNG HÔ HẤP|VIÊM PHỔI|VIÊM THẬN BỂ THẬN|VIÊM BÀNG QUANG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Cefixim] — ICD/XML1 không khớp chỉ định. Chỉ định: IMEXIME 50 — Nhiễm khuẩn hô hấp (J01-J15) hoặc Nhiễm khuẩn tiết niệu (N10, N30).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_93",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_93",
    "TEN_QUY_TAC": "[Cefpodoxim] Cảnh báo liều nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.177' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 10",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Cefpodoxim trẻ em (> 10mg/kg/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_94",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_94",
    "TEN_QUY_TAC": "[Cefpodoxim] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.177' AND (XML1.MA_BENH_CHINH IN ('Z88.1') OR XML1.MA_BENH_KT REGEXP 'Z88\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Dị ứng Cephalosporin (Z88.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_95",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_95",
    "TEN_QUY_TAC": "[Cefpodoxim] Kiểm tra chỉ định ICD/chẩn đoán (Vipocef)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.177' AND THUOC_95_VI_PHAM_CHI_DINH(XML1, XML2)",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Cefpodoxim (40.177) không khớp nhóm chỉ định được phép (hô hấp J01–J18/J20/J44, tai H66–H67, tiết niệu N10/N30…, da L…, lậu A54… theo ICD/chẩn đoán). Quy tắc này không kiểm tra liều — xem THUOC_93 (mg/kg), THUOC_96 (tần suất).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_96",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_96",
    "TEN_QUY_TAC": "[Cefpodoxim] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.177' AND TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Cefpodoxim được chỉ định chia 2 lần/ngày (cách nhau mỗi 12h).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_97",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_97",
    "TEN_QUY_TAC": "[Celecoxib] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.28' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'I50', 'I21', 'J45') OR XML1.MA_BENH_KT REGEXP 'K25|K26|I50|I21|J45')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày (K25), Suy tim (I50), NMCT cấp (I21), Hen (J45).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_98",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_98",
    "TEN_QUY_TAC": "[Celecoxib] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.28' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THO\u00c1I H\u00d3A KH\u1edaP|THO\u00c1I HO\u00c1 KH\u1edaP|VI\u00caM X\u01af\u01a0NG KH\u1edaP|VI\u00caM KH\u1edaP D\u1ea0NG TH\u1ea4P|VI\u00caM C\u1ed8T S\u1ed0NG D\u00cdNH|VI\u00caM C\u1ed8T S\u1ed0NG D\u00cd|\u0110AU KH\u1edaP|G\u00daT|GOUT|B\u1ec6NH G\u00daT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Celecoxib] — ICD/XML1 không khớp chỉ định. Chỉ định: thoái hoá khớp, viêm khớp (bao gồm viêm khớp dạng thấp), viêm cột sống, gút — mã Celecoxib 40.28.",
    "GHI_CHU": "2026-04-20: Ch\u1ec9 \u0111\u1ecbnh ICD theo catalog_mapping ICD_DRUG (\u0111\u1ed3ng b\u1ed9 th\u1ebb Mapping nghi\u1ec7p v\u1ee5). Quy t\u1eafc ch\u1ec9 k\u00edch ho\u1ea1t khi \u0111\u00e3 c\u00f3 d\u00f2ng mapping h\u1ee3p l\u1ec7 cho m\u00e3 40.28 + gi\u1eef REGEXP CHAN_DOAN_RV.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_99",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_99",
    "TEN_QUY_TAC": "[Celecoxib] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.28' AND (CALC_SL_MOI_NGAY * 200) > 400",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Vượt liều Celecoxib tối đa (> 400mg/ngày). Nguy cơ biến cố tim mạch và thủng dạ dày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_100",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_100",
    "TEN_QUY_TAC": "[Cetirizin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.79' AND TONG_LIEU_24H > 10",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Cetirizin (Kacerin) liều tối đa 10mg/ngày. Tăng liều chỉ làm tăng độc tính an thần (buồn ngủ) mà không tăng hiệu quả.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_101",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_101",
    "TEN_QUY_TAC": "[Cetirizin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.79' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_102",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_102",
    "TEN_QUY_TAC": "[Cetirizin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.79' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM MŨI DỊ ỨNG|MÀY ĐAY)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Cetirizin] — ICD/XML1 không khớp chỉ định. Chỉ định: Kacerin — Viêm mũi dị ứng (J30) hoặc Mày đay (L50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_103",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_103",
    "TEN_QUY_TAC": "[Cinnarizin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.80' AND (XML1.MA_BENH_CHINH IN ('G20', 'O21') OR XML1.MA_BENH_KT REGEXP 'G20|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Parkinson (G20) hoặc Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_104",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_104",
    "TEN_QUY_TAC": "[Cinnarizin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.80' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(CHÓNG MẶT|RỐI LOẠN TIỀN ĐÌNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Cinnarizin] — ICD/XML1 không khớp chỉ định. Chỉ định: Cinnarizin — Rối loạn tiền đình (H81, R42).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_105",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_105",
    "TEN_QUY_TAC": "[Cinnarizin] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.80' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Cinnarizin dùng tối đa 3 lần/ngày. Thận trọng nguy cơ gây ngủ gà.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_106",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_106",
    "TEN_QUY_TAC": "[Clindamycin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.217' AND (XML1.MA_BENH_CHINH IN ('A04.7', 'K52.9') OR XML1.MA_BENH_KT REGEXP 'A04\\.7|K52\\.9')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Viêm đại tràng màng giả (A04.7, K52.9).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_107",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_107",
    "TEN_QUY_TAC": "[Clindamycin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.217' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM AMIDAN|VIÊM HỌNG|CHỐC|NHIỄM TRÙNG DA|ÁP XE DA|NHỌT|VIÊM MÔ TẾ BÀO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Clindamycin] — ICD/XML1 không khớp chỉ định. Chỉ định: Clyodas 300 — Nhiễm khuẩn hô hấp (J01, J03) hoặc Nhiễm khuẩn da, mô mềm (L01-L03).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_108",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_108",
    "TEN_QUY_TAC": "[Clindamycin] Tần suất an toàn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.217' AND CALC_TAN_SUAT > 4",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Clindamycin dùng quá 4 lần/ngày. Thường chỉ chia liều mỗi 6-8 giờ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_109",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_109",
    "TEN_QUY_TAC": "[Clopidogrel] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.540' AND (XML1.MA_BENH_CHINH IN ('I60', 'K25', 'K26', 'R58', 'K92.2') OR XML1.MA_BENH_KT REGEXP 'I60|K25|K26|R58|K92\\.2')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Xuất huyết nội sọ (I60), Loét tiêu hóa đang chảy máu (K25, K92.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_110",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_110",
    "TEN_QUY_TAC": "[Clopidogrel] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.540' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc chống kết tập tiểu cầu DogrelSaVi cấp dư so với y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_111",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_111",
    "TEN_QUY_TAC": "[Clopidogrel] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.540' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NHỒI MÁU CƠ TIM|ĐỘT QUỴ|NHỒI MÁU NÃO|TAI BIẾN MẠCH MÁU NÃO|XƠ VỮA ĐỘNG MẠCH|XƠ VỮA ĐM|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC|BỆNH TIM THIẾU MÁU|THIẾU MÁU CỤC BỘ CƠ TIM|TẮC ĐỘNG MẠCH|HẸP ĐỘNG MẠCH|THUYÊN TẮC|HUYẾT KHỐI ĐỘNG MẠCH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Clopidogrel] — ICD/XML1 không khớp chỉ định. Chỉ định: DogrelSaVi — NMCT (I21), Đột quỵ (I63), Xơ vữa ĐM (I70), Đau thắt ngực (I20), Bệnh tim thiếu máu cục bộ mạn (I25).",
    "GHI_CHU": "SỬA 21/03/2026: Bổ sung I25 (Bệnh tim thiếu máu cục bộ mạn tính) - dự phòng tim mạch cho BN đa yếu tố nguy cơ",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_112",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_112",
    "TEN_QUY_TAC": "[Clotrimazol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.593' AND (XML1.MA_BENH_CHINH IN ('Z88.8') OR XML1.MA_BENH_KT REGEXP 'Z88\\.8')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử dị ứng thuốc chống nấm (Z88.8).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_113",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_113",
    "TEN_QUY_TAC": "[Clotrimazol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.593' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NẤM DA|NẤM|NẤM NÔNG|NẤM CANDIDA|NHIỄM NẤM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Clotrimazol] — ICD/XML1 không khớp chỉ định. Chỉ định: Cafunten — Nấm da (B35-B37).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_114",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_114",
    "TEN_QUY_TAC": "[Colchicin] Cảnh báo lạm dụng liều cao",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.61' AND TONG_LIEU_24H > 2",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Colchicin > 2mg/ngày KHÔNG làm tăng hiệu quả giảm đau đợt Gout cấp nhưng làm tăng đột biến độc tính tiêu hóa và tiêu cơ vân (Theo Guideline ACR).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_115",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_115",
    "TEN_QUY_TAC": "[Colchicin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.61' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'K72') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận/gan nặng (N18.4, N18.5, K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_116",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_116",
    "TEN_QUY_TAC": "[Colchicin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.61' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(GÚT|GOUT|BỆNH GÚT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Colchicin] — ICD/XML1 không khớp chỉ định. Chỉ định: Colchicin — Gout (M10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_117",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_117",
    "TEN_QUY_TAC": "[Coperil plus] Tần suất phối hợp",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.522' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc phối hợp hạ áp Coperil plus chỉ dùng 1 lần duy nhất trong ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_118",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_118",
    "TEN_QUY_TAC": "[Desloratadin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.82' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc cần thận trọng hoặc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_119",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_119",
    "TEN_QUY_TAC": "[Desloratadin] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.82' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Desloratadin (Sosallergy syrup / Setbozi) chỉ định dùng 1 lần/ngày.",
    "GHI_CHU": "SỬA: Bổ sung tên biệt dược 'Setbozi' bên cạnh 'Sosallergy syrup'",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_120",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_120",
    "TEN_QUY_TAC": "[Mepoly] ICD chỉ định thanh toán (TT)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.203' AND NOT (XML1.MA_BENH_CHINH REGEXP 'A74\\\\.0|H10\\\\.0|H10\\\\.1|H10\\\\.2|H10\\\\.3|H10\\\\.4|H10\\\\.5|H10\\\\.8|H10\\\\.9|H13\\\\.1|H13\\\\.2|H60\\\\.3|H60\\\\.5|H60\\\\.8|H60\\\\.9|H62\\\\.0|H62\\\\.1|H62\\\\.2|H62\\\\.3|H62\\\\.4|J01\\\\.0|J01\\\\.1|J01\\\\.2|J01\\\\.3|J01\\\\.9|J30\\\\.0|J30\\\\.1|J30\\\\.2|J30\\\\.3|J30\\\\.4|J31\\\\.0|J31\\\\.1|J32\\\\.0|J32\\\\.1|J32\\\\.2|J32\\\\.3|J32\\\\.8|J32\\\\.9|J33\\\\.0|T70\\\\.1|H10(?:$|[;,\\\\s|/])|H60(?:$|[;,\\\\s|/])|J00(?:$|[;,\\\\s|/])|J01(?:$|[;,\\\\s|/])|J30(?:$|[;,\\\\s|/])|J31(?:$|[;,\\\\s|/])|J32(?:$|[;,\\\\s|/])|J33(?:$|[;,\\\\s|/])' OR XML1.MA_BENH_KT REGEXP 'A74\\\\.0|H10\\\\.0|H10\\\\.1|H10\\\\.2|H10\\\\.3|H10\\\\.4|H10\\\\.5|H10\\\\.8|H10\\\\.9|H13\\\\.1|H13\\\\.2|H60\\\\.3|H60\\\\.5|H60\\\\.8|H60\\\\.9|H62\\\\.0|H62\\\\.1|H62\\\\.2|H62\\\\.3|H62\\\\.4|J01\\\\.0|J01\\\\.1|J01\\\\.2|J01\\\\.3|J01\\\\.9|J30\\\\.0|J30\\\\.1|J30\\\\.2|J30\\\\.3|J30\\\\.4|J31\\\\.0|J31\\\\.1|J32\\\\.0|J32\\\\.1|J32\\\\.2|J32\\\\.3|J32\\\\.8|J32\\\\.9|J33\\\\.0|T70\\\\.1|H10(?:$|[;,\\\\s|/])|H60(?:$|[;,\\\\s|/])|J00(?:$|[;,\\\\s|/])|J01(?:$|[;,\\\\s|/])|J30(?:$|[;,\\\\s|/])|J31(?:$|[;,\\\\s|/])|J32(?:$|[;,\\\\s|/])|J33(?:$|[;,\\\\s|/])' OR XML1.CHAN_DOAN_RV REGEXP '(?i)(VIÊM KẾT MẠC|VIÊM GIÁC MẠC|VIÊM KẾT MẠC DO CHLAMYDIA|VIÊM TAI NGOÀI|VIÊM XOANG|VIÊM MŨI HỌNG|VIÊM MŨI|VIÊM HỌNG|VIÊM MŨI DỊ ỨNG|VIÊM MŨI VẬN MẠCH|VIÊM MŨI DỊ ỨNG DO PHẤN HOA|POLÍP MŨI|POLYP MŨI|CHẤN THƯƠNG KHÍ ÁP|KHÍ ÁP|SỨC ÉP|CHLAMYDIA|NHẦY MỦ|DỊ ỨNG CẤP|CẢM THƯỜNG)')",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Mepoly chỉ TT khi chỉ định thuộc nhóm ICD-10 theo TT (không chỉ H10/H16). Mã gồm: A74.0; H10; H10.0–H10.5; H10.8; H10.9; H13.1*; H13.2*; H60; H60.3; H60.5; H60.8; H60.9; H62.0*–H62.4*; J00; J01 (gồm J01.0–J01.3, J01.9); J30–J30.4; J31; J31.0; J31.1; J32–J32.9 (theo danh mục); J33; J33.0; T70.1 (vd. viêm/xoang liên quan chấn thương khí áp). Phạm vi bệnh học: viêm kết mạc/giác mạc và biến thể; viêm tai ngoài; viêm mũi–xoang–họng mạn/cấp, políp mũi, v.v. Chi tiết thuốc: [40.203] Mepoly.",
    "GHI_CHU": "Cập nhật 04/2026: Mở rộng ICD A74/H10/H13/H60/H62/J00–J33/T70.1 và CHẨN ĐOÁN RV theo TT; bỏ giới hạn H10/H16 đơn thuần.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_121",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_121",
    "TEN_QUY_TAC": "[Dexamethason + Neomycin + Polymyxin]",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.203' AND (XML1.MA_BENH_CHINH IN ('B00', 'B35', 'B36', 'B37') OR XML1.MA_BENH_KT REGEXP 'B00|B35|B36|B37')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho bệnh nhân Viêm giác mạc do Herpes (B00) hoặc Nhiễm nấm mắt (B35-B37).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_122",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_122",
    "TEN_QUY_TAC": "[Diacerein] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.63' AND (XML1.MA_BENH_CHINH IN ('K70', 'K71', 'K72') OR XML1.MA_BENH_KT REGEXP 'K70|K71|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có Bệnh lý gan tiến triển (K70, K71, K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_123",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_123",
    "TEN_QUY_TAC": "[Diacerein] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.63' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|THOÁI HÓA KHỚP GỐI|THOÁI HOÁ KHỚP GỐI)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Diacerein] — ICD/XML1 không khớp chỉ định. Chỉ định: Cytan — Thoái hóa khớp (M15, M17).",
    "GHI_CHU": "SỬA 21/03/2026: Bổ sung M17 (Thoái hóa khớp gối) - phát hiện từ rà soát HĐ thực tế BN TRƯƠNG THANH TÂM (401929)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_123A",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_123a",
    "TEN_QUY_TAC": "[Diacerein] Khuyến cáo người cao tuổi ≥ 65",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.63' AND XML1.TUOI_NAM >= 65",
    "CANH_BAO": "⚠️ [KHUYẾN CÁO]: Người cao tuổi: Khuyến cáo không kê Diacerein cho bệnh nhân từ 65 tuổi trở lên.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "Bo sung quy tac theo yeu cau 30/04/2026"
  },
  {
    "id": "SEED_THUOC_124",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_124",
    "TEN_QUY_TAC": "[Diacerein] Tần suất khởi đầu",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.63' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Cytan thường bắt đầu với 1 viên/ngày (tối) để tránh nhuận tràng quá mức.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_125",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_125",
    "TEN_QUY_TAC": "[Diệp hạ châu đắng...] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.28.2' AND (XML1.MA_BENH_CHINH IN ('O21') OR XML1.MA_BENH_KT REGEXP 'O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_126",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_126",
    "TEN_QUY_TAC": "[Diệp hạ châu đắng...] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.28.2' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(BỆNH GAN DO THUỐC|TỔN THƯƠNG GAN|VIÊM GAN MẠN|GAN NHIỄM MỠ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Diệp hạ châu đắng...] — ICD/XML1 không khớp chỉ định. Chỉ định: ATILIVER DIỆP HẠ CHÂU — Viêm gan (K71, K73) hoặc Gan nhiễm mỡ (K76.0).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_127",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_127",
    "TEN_QUY_TAC": "[Diosmectit] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.722' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_128",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_128",
    "TEN_QUY_TAC": "[Diosmectit] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.722' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TIÊU CHẢY|VIÊM RUỘT|VIÊM ĐẠI TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Diosmectit] — ICD/XML1 không khớp chỉ định. Chỉ định: Cezmeta — Tiêu chảy (A09, K52.9).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_129",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_129",
    "TEN_QUY_TAC": "[Diosmectit] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.722' AND TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Cezmeta (Diosmectit) dùng tối đa 3 lần/ngày. Dùng quá nhiều lần gây táo bón nặng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_130",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_130",
    "TEN_QUY_TAC": "[Diosmin; Hesperidin] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.736' AND (XML1.MA_BENH_CHINH IN ('O21') OR XML1.MA_BENH_KT REGEXP 'O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Cần thận trọng ở Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_131",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_131",
    "TEN_QUY_TAC": "[Diosmin; Hesperidin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.736' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(GIÃN TĨNH MẠCH|SUY TĨNH MẠCH CHI DƯỚI|TRĨ|SUY TĨNH MẠCH|TĨNH MẠCH MẠN)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Diosmin; Hesperidin] — ICD/XML1 không khớp chỉ định. Chỉ định: Bividios — Suy tĩnh mạch, Trĩ (I83, I84, I87).",
    "GHI_CHU": "SỬA 21/03/2026: Bổ sung I87.2 vào điều kiện MA_BENH_CHINH - phát hiện từ rà soát HĐ BN DƯƠNG THỊ HUỆ (401961). Lưu ý: I87.2 đã được bắt bởi LIKE '%I87%', quy tắc không cần sửa điều kiện LIKE. Vấn đề chính là BN THIẾU mã I87 trong hồ sơ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_132",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_132",
    "TEN_QUY_TAC": "[Diosmin] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.736' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư thuốc điều trị tĩnh mạch Bividios.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_133",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_133",
    "TEN_QUY_TAC": "[Diphenhydramin] Cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.84' AND XML2.SO_LUONG > CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Dimedrol cấp phát dư so với y lệnh điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_134",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_134",
    "TEN_QUY_TAC": "[Diphenhydramin] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.84' AND (XML1.MA_BENH_CHINH IN ('J45', 'N40', 'H40') OR XML1.MA_BENH_KT REGEXP 'J45|N40|H40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Hen (J45), Phì đại tiền liệt tuyến (N40), Glaucom (H40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_135",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_135",
    "TEN_QUY_TAC": "[Diphenhydramin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.84' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(DỊ ỨNG|PHẢN VỆ|SỐC PHẢN VỆ|MÀY ĐAY)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Diphenhydramin] — ICD/XML1 không khớp chỉ định. Chỉ định: Dimedrol — Dị ứng, Mày đay (T78.4, L50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_136",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_136",
    "TEN_QUY_TAC": "[Domperidon] Cảnh báo liều nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.688' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 0.75",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Domperidon cho trẻ em (> 0.75mg/kg/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_137",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_137",
    "TEN_QUY_TAC": "[Domperidon] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.688' AND TONG_LIEU_24H > 30",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Domperidon > 30mg/ngày làm tăng nguy cơ kéo dài khoảng QT và đột tử do tim. (Cảnh báo của EMA & Cục Quản lý Dược).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_138",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_138",
    "TEN_QUY_TAC": "[Domperidon] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.688' AND (XML1.MA_BENH_CHINH IN ('K56', 'K92.2', 'K72') OR XML1.MA_BENH_KT REGEXP 'K56|K92\\.2|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56), Xuất huyết tiêu hóa (K92.2) hoặc Suy gan nặng (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_139",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_139",
    "TEN_QUY_TAC": "[Domperidon] Chỉ định: nôn/buồn nôn và bệnh lý dạ dày–tá tràng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.688' AND ENGINE_RULE_THUOC_139",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Domperidon phù hợp khi điều trị triệu chứng nôn/buồn nôn (R11…) hoặc trong bối cảnh bệnh lý dạ dày–tá tràng (vd. K21 trào ngược; K25–K28 loét; K29 viêm; K30 khó tiêu chức năng; K31…). Kiểm tra ICD và chẩn đoán lâm sàng trên hồ sơ.",
    "GHI_CHU": "Engine: THUOC_139 — coChiDinhHopLeDomperidon139 (R11; K21 K25–K31; từ khóa nôn/buồn nôn, dạ dày–tá tràng, GERD, loét…).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_140",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_140",
    "TEN_QUY_TAC": "[Dopolys-S] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.734' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng viên kê đơn không khớp với hướng dẫn LIEU_DUNG.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_141",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_141",
    "TEN_QUY_TAC": "[Dorocodon] Giới hạn Codein",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.991' AND (CALC_SL_MOI_NGAY * 10) > 240",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Codein trong thuốc ho vượt ngưỡng an toàn. Nguy cơ ức chế hô hấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_142",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_142",
    "TEN_QUY_TAC": "[Drotaverin] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.697' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc chống co thắt Zecein cấp dư so với y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_143",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_143",
    "TEN_QUY_TAC": "[Enterogolds] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.719' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư thuốc Bacillus clausii. Y lệnh: {CALC_SL_MOI_NGAY} viên/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_144",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_144",
    "TEN_QUY_TAC": "[Eperison HCl] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.829' AND (XML1.MA_BENH_CHINH IN ('G70') OR XML1.MA_BENH_KT REGEXP 'G70')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Nhược cơ (G70).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_145",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_145",
    "TEN_QUY_TAC": "[Eperison HCl] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.829' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|ĐAU LƯNG|ĐAU THẮT LƯNG|ĐAU CỘT SỐNG|BỆNH LÝ CỘT SỐNG|CĂNG CƠ|CO CƠ QUÁ MỨC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Eperison HCl] — ICD/XML1 không khớp chỉ định. Chỉ định: Ryzonal — Co thắt cơ / Đau cột sống / Căng cơ (M15, M53, M54, M62.6).",
    "GHI_CHU": "SỬA 21/03/2026: Bổ sung M62.6 (Căng cơ quá mức) - phát hiện từ rà soát HĐ BN HUỲNH THỊ PHƯƠNG (401925)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_146",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_146",
    "TEN_QUY_TAC": "[Eperison] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.829' AND TONG_LIEU_24H > 150",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Eperison (> 150mg/ngày tương đương 3 viên 50mg). Tăng nguy cơ yếu cơ, sốc phản vệ và chóng mặt.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_147",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_147",
    "TEN_QUY_TAC": "[Eperison] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.829' AND TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc giãn cơ Eperison (Ryzonal) có T1/2 ngắn, dùng tối đa 3 lần/ngày (cùng bữa ăn).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_148",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_148",
    "TEN_QUY_TAC": "[Eprazinon] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.995' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc long đờm Eprazinon dùng tối đa 3 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_149",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_149",
    "TEN_QUY_TAC": "[Esomeprazol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.678' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Cần hiệu chỉnh liều hoặc chống chỉ định cho bệnh nhân có chẩn đoán Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_150",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_150",
    "TEN_QUY_TAC": "[Esomeprazol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.678' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TRÀO NGƯỢC DẠ DÀY|GERD|LOÉT DẠ DÀY|LOÉT TÁ TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Esomeprazol] — ICD/XML1 không khớp chỉ định. Chỉ định: Stadnex 20 CAP — Trào ngược dạ dày thực quản (K21) hoặc Loét (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_151",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_151",
    "TEN_QUY_TAC": "[Esomeprazol] Tần suất an toàn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.678' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Esomeprazol dùng tối đa 2 lần/ngày. Tăng tần suất không tăng hiệu quả ức chế acid.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_152",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_152",
    "TEN_QUY_TAC": "[Etifoxin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.934' AND (XML1.MA_BENH_CHINH IN ('K72', 'G70', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'K72|G70|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan/thận nặng (K72, N18.4) hoặc Nhược cơ (G70).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_153",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_153",
    "TEN_QUY_TAC": "[Etifoxin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.934' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(RỐI LOẠN LO ÂU|LO ÂU LAN TỎA|LO ÂU VÀ TRẦM CẢM|RỐI LOẠN THẦN KINH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Etifoxin] — ICD/XML1 không khớp chỉ định. Chỉ định: Stresam — Rối loạn lo âu, Suy nhược thần kinh (F41.1, F41.2, F48.9).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_154",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_154",
    "TEN_QUY_TAC": "[Etoricoxib] Cảnh báo liều tuyệt đối",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.33' AND TONG_LIEU_24H > 120",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Etoricoxib tuyệt đối không vượt quá 120mg/ngày (chỉ dùng cho Gout cấp tối đa 8 ngày). Nguy cơ tim mạch rất cao.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_155",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_155",
    "TEN_QUY_TAC": "[Etoricoxib] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.33' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'I50', 'I21') OR XML1.MA_BENH_KT REGEXP 'K25|K26|I50|I21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày (K25, K26), Suy tim (I50) hoặc Nhồi máu cơ tim (I21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_156",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_156",
    "TEN_QUY_TAC": "[Etoricoxib] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.33' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|VIÊM KHỚP DẠNG THẤP|VIÊM CỘT SỐNG DÍNH|VIÊM CỘT SỐNG DÍ|GÚT|GOUT|BỆNH GÚT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Etoricoxib] — ICD/XML1 không khớp chỉ định. Chỉ định: Exibapc 120 — Thoái hóa khớp (M15), Viêm khớp dạng thấp (M05), Cột sống dính khớp (M45) hoặc Gout cấp (M10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_157",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_157",
    "TEN_QUY_TAC": "[Etoricoxib] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.33' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Etoricoxib (Exibapc) có T1/2 ~22h, chỉ được uống 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_158",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_158",
    "TEN_QUY_TAC": "[Famotidin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.666' AND TONG_LIEU_24H > 80",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Famotidin (> 80mg/ngày). Không tăng hiệu quả ức chế acid mà làm tăng độc tính thần kinh (lú lẫn, ảo giác).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_159",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_159",
    "TEN_QUY_TAC": "[Famotidin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.666' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_160",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_160",
    "TEN_QUY_TAC": "[Famotidin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.666' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TRÀO NGƯỢC DẠ DÀY|GERD|LOÉT DẠ DÀY|LOÉT TÁ TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Famotidin] — ICD/XML1 không khớp chỉ định. Chỉ định: A.T Famotidine 40 inj — Trào ngược GERD (K21) hoặc Loét dạ dày - tá tràng (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_161",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_161",
    "TEN_QUY_TAC": "[Famotidin] Kiểm tra tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.666' AND TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Famotidin tiêm (A.T Famotidine 40 inj) dùng tối đa 2 lần/ngày (cách nhau 12h).",
    "GHI_CHU": "Đã gộp dòng trùng [Famotidin] tần suất tối đa",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_162",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_162",
    "TEN_QUY_TAC": "[Fastum Gel] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.38' AND XML2.SO_LUONG > 2",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Cấp > 2 tuýp Gel bôi trong một đợt điều trị ngoại trú. Vui lòng xác nhận tính hợp lý.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_163",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_163",
    "TEN_QUY_TAC": "[Felodipin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.502' AND (XML1.MA_BENH_CHINH IN ('I95.1', 'O21', 'I21') OR XML1.MA_BENH_KT REGEXP 'I95\\.1|O21|I21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Nhồi máu cơ tim (I21), Phụ nữ có thai (O21) hoặc Hạ huyết áp (I95.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_164",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_164",
    "TEN_QUY_TAC": "[Felodipin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.502' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Felodipin] — ICD/XML1 không khớp chỉ định. Chỉ định: Felodipine Stella 5 mg retard — Tăng huyết áp (I10) hoặc Đau thắt ngực (I20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_165",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_165",
    "TEN_QUY_TAC": "[Felodipine] Tần suất Retard",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.502' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Dạng giải phóng chậm (Retard) bắt buộc chỉ dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_166",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_166",
    "TEN_QUY_TAC": "[Fenofibrat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.553' AND (XML1.MA_BENH_CHINH IN ('K71', 'K72', 'N18.4', 'N18.5', 'K80') OR XML1.MA_BENH_KT REGEXP 'K71|K72|N18\\.4|N18\\.5|K80')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Bệnh gan/thận nặng, hoặc Bệnh sỏi mật (K80).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_167",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_167",
    "TEN_QUY_TAC": "[Fenofibrat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.553' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG CHOLESTEROL|RỐI LOẠN LIPID|TĂNG TRIGLYCERID|TĂNG LIPID MÁU HỖN HỢP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Fenofibrat] — ICD/XML1 không khớp chỉ định. Chỉ định: Mibefen NT 145 — Rối loạn Lipoprotein máu (E78).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_168",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_168",
    "TEN_QUY_TAC": "[Fenofibrat] Tần suất Statin/Fibrat",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.553' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Mibefen NT 145 chỉ dùng 1 lần/ngày để giảm nguy cơ độc tính trên cơ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_169",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_169",
    "TEN_QUY_TAC": "[Ferovin] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.433' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng ống sắt (Ferovin) kê đơn không khớp với hướng dẫn sử dụng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_170",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_170",
    "TEN_QUY_TAC": "[Fexofenadin hydroclorid] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.87' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_171",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_171",
    "TEN_QUY_TAC": "[Fexofenadin hydroclorid] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.87' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM MŨI DỊ ỨNG|MÀY ĐAY)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Fexofenadin hydroclorid] — ICD/XML1 không khớp chỉ định. Chỉ định: Danapha-Telfadin — Viêm mũi dị ứng (J30) hoặc Mày đay (L50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_172",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_172",
    "TEN_QUY_TAC": "[Fexofenadin] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.87' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc chống dị ứng Fexostad dùng tối đa 2 lần/ngày (liều 60mg).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_173",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_173",
    "TEN_QUY_TAC": "[Fluconazol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.288' AND (XML1.MA_BENH_CHINH IN ('K72', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'K72|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan nặng (K72) hoặc Suy thận nặng (N18.4).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_174",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_174",
    "TEN_QUY_TAC": "[Fluconazol] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.288' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc kháng nấm Flupaz 50 cấp dư so với phác đồ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_175",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_175",
    "TEN_QUY_TAC": "[Fluconazol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.288' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NẤM DA|NẤM|NẤM NÔNG|NẤM CANDIDA|NHIỄM NẤM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Fluconazol] — ICD/XML1 không khớp chỉ định. Chỉ định: Flupaz 50 — Nấm niêm mạc, Nấm da (B35, B36, B37).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_176",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_176",
    "TEN_QUY_TAC": "[Flunarizin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.336' AND (XML1.MA_BENH_CHINH IN ('G20', 'F32', 'O21') OR XML1.MA_BENH_KT REGEXP 'G20|F32|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Parkinson (G20), Tiền sử trầm cảm (F32), Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_177",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_177",
    "TEN_QUY_TAC": "[Flunarizin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.336' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐAU NỬA ĐẦU|MIGRAINE|CHÓNG MẶT|RỐI LOẠN TIỀN ĐÌNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Flunarizin] — ICD/XML1 không khớp chỉ định. Chỉ định: Flunarizin 10mg — Đau nửa đầu (G43) hoặc Chóng mặt (H81).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_178",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_178",
    "TEN_QUY_TAC": "[Flunarizin] Tần suất dự phòng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.336' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Flunarizin thường chỉ dùng 1 lần/ngày (buổi tối). Tần suất cao hơn có thể tăng nguy cơ triệu chứng ngoại tháp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_179",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_179",
    "TEN_QUY_TAC": "[Furosemid + spironolacton] Chống CĐ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.661' AND (XML1.MA_BENH_CHINH IN ('N17', 'E87.5', 'K72') OR XML1.MA_BENH_KT REGEXP 'N17|E87\\.5|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Vô niệu/Suy thận cấp (N17), Tăng Kali máu (E87.5), Hôn mê gan (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_180",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_180",
    "TEN_QUY_TAC": "[Furosemid + spironolacton] Kiểm tra",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.661' AND XML1.MA_BENH_CHINH NOT IN ('I50', 'K74', 'N04') AND XML1.MA_BENH_KT NOT LIKE '%I50%' AND XML1.MA_BENH_KT NOT LIKE '%K74%' AND XML1.MA_BENH_KT NOT LIKE '%N04%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(SUY TIM|XƠ GAN|HỘI CHỨNG THẬN HƯ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Spinolac fort chỉ thanh toán cho Phù do Suy tim (I50), Xơ gan (K74) hoặc Thận hư (N04).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_181",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_181",
    "TEN_QUY_TAC": "[Furosemid Inj] Check lẻ ống",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.659' AND XML2.SO_LUONG > CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [HÀNH CHÍNH]: Thuốc tiêm lợi tiểu Vinzix cấp dư so với quy tắc làm tròn y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_182",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_182",
    "TEN_QUY_TAC": "[Furosemid Inj] Liều tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.659' AND (CALC_SL_MOI_NGAY * 20) > 1500",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Furosemid tiêm vượt 1500mg/ngày. Nguy cơ điếc tai không hồi phục.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_183",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_183",
    "TEN_QUY_TAC": "[Furosemid] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.659' AND (XML1.MA_BENH_CHINH IN ('K72', 'N17', 'E87.6') OR XML1.MA_BENH_KT REGEXP 'K72|N17|E87\\.6')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Suy gan nặng (K72), Suy thận vô niệu (N17), Hạ Kali máu (E87.6).",
    "GHI_CHU": "Đã gộp dòng trùng [Furosemide] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_184",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_184",
    "TEN_QUY_TAC": "[Furosemid] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.659' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(SUY TIM|TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|HỘI CHỨNG THẬN HƯ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Furosemid] — ICD/XML1 không khớp chỉ định. Chỉ định: Vinzix (20mg/40mg) — Suy tim, THA, Phù/Hội chứng thận hư (I50, I10, N04).",
    "GHI_CHU": "Đã gộp dòng trùng [Furosemide] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_185",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_185",
    "TEN_QUY_TAC": "[Furosemide] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.659' AND (CALC_SL_MOI_NGAY * 40) > 600",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Furosemide vượt ngưỡng an toàn tối đa (600mg/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_186",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_186",
    "TEN_QUY_TAC": "[Gabapentin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.132' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc cần thận trọng hoặc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_187",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_187",
    "TEN_QUY_TAC": "[Gabapentin] Giới hạn liều/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.132' AND (CALC_SL_MOI_NGAY * 300) > 3600",
    "CANH_BAO": "⛔ [SAI LIỀU]: Gabapentin vượt liều tối đa 3600mg/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_188",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_188",
    "TEN_QUY_TAC": "[Gabapentin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.132' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐỘNG KINH|ĐAU DÂY THẦN KINH|VIÊM DÂY THẦN KINH|VIÊM DÂY THẦN KINH SAU ZONA)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Gabapentin] — ICD/XML1 không khớp chỉ định. Chỉ định: Neupencap — Động kinh (G40) hoặc Đau dây thần kinh (M79.2, G53.0).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_189",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_189",
    "TEN_QUY_TAC": "[Ginkgo + Heptaminol + Troxerutin]",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.734' AND XML1.MA_BENH_CHINH NOT IN ('I83', 'I87', 'I95') AND XML1.MA_BENH_KT NOT LIKE '%I83%' AND XML1.MA_BENH_KT NOT LIKE '%I87%' AND XML1.MA_BENH_KT NOT LIKE '%I95%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(GIÃN TĨNH MẠCH|SUY TĨNH MẠCH CHI DƯỚI|SUY TĨNH MẠCH|TĨNH MẠCH MẠN|HẠ HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Dopolys - S chỉ thanh toán cho Suy tĩnh mạch (I83) hoặc Hạ huyết áp tư thế (I95).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_190",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_190",
    "TEN_QUY_TAC": "[Ginkgo + Heptaminol + Troxerutin]",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.734' AND (XML1.MA_BENH_CHINH IN ('E05', 'I10') OR XML1.MA_BENH_KT REGEXP 'E05|I10')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Cường giáp (E05) hoặc Tăng huyết áp (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_191",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_191",
    "TEN_QUY_TAC": "[Gliclada MR] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND XML2.TEN_THUOC LIKE '%Gliclada%' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư thuốc tiểu đường. Kiểm tra lại số ngày điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_192",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_192",
    "TEN_QUY_TAC": "[Gliclazid MR] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND XML2.TEN_THUOC LIKE '%Gliclada%' AND TONG_LIEU_24H > 120",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Gliclazid tối đa là 120mg/ngày. Vượt liều không tăng kiểm soát đường huyết mà làm tăng nguy cơ tụt đường huyết.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_193",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_193",
    "TEN_QUY_TAC": "[Gliclazid MR] Chốt tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.800' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Dạng MR (giải phóng kéo dài) chỉ dùng 1 lần duy nhất vào bữa sáng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_194",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_194",
    "TEN_QUY_TAC": "[Gliclazid MR] Kiểm tra tần suất Dạng MR",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND XML2.TEN_THUOC LIKE '%Gliclada%' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ NGHIÊM TRỌNG]: Gliclada 60mg MR là dạng bào chế giải phóng kéo dài. Tuyệt đối chỉ uống 1 lần/ngày vào bữa sáng. Dùng nhiều lần/ngày sẽ gây hạ đường huyết kịch phát tồi tệ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_195",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_195",
    "TEN_QUY_TAC": "[Gliclazid] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.800' AND (XML1.MA_BENH_CHINH IN ('E10', 'E16.2', 'N18.4', 'N18.5', 'K72', 'O21') OR XML1.MA_BENH_KT REGEXP 'E10|E16\\.2|N18\\.4|N18\\.5|K72|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho ĐTĐ Tuýp 1 (E10), Suy thận nặng, Suy gan nặng, Có thai (O21), Hạ đường huyết (E16.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_196",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_196",
    "TEN_QUY_TAC": "[Gliclazid] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.800' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐÁI THÁO ĐƯỜNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Gliclazid] — ICD/XML1 không khớp chỉ định. Chỉ định: Dorocron MR 60mg — Đái tháo đường Tuýp 2 (E11).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_197",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_197",
    "TEN_QUY_TAC": "[Glimepiride] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.801' AND (XML1.MA_BENH_CHINH IN ('E10', 'E16.2', 'N18.4', 'N18.5', 'K72', 'O21') OR XML1.MA_BENH_KT REGEXP 'E10|E16\\.2|N18\\.4|N18\\.5|K72|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho ĐTĐ Tuýp 1 (E10), Hạ đường huyết (E16.2), Suy gan/thận nặng, Có thai.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_198",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_198",
    "TEN_QUY_TAC": "[Glimepiride] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.801' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐÁI THÁO ĐƯỜNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Glimepiride] — ICD/XML1 không khớp chỉ định. Chỉ định: Glumerif 2 — Đái tháo đường Tuýp 2 (E11).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_199",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_199",
    "TEN_QUY_TAC": "[Glimepiride] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.801' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc tiểu đường Glimepiride chỉ dùng 1 lần duy nhất vào bữa sáng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_200",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_200",
    "TEN_QUY_TAC": "[Glucosamin] Cảnh báo liều/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.64' AND TONG_LIEU_24H > 1500",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Liều Glucosamin tối ưu là 1500mg/ngày. Dùng liều cao hơn không mang lại lợi ích lâm sàng và vi phạm quy định thanh toán BHYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_201",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_201",
    "TEN_QUY_TAC": "[Glucosamin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.64' AND (XML1.MA_BENH_CHINH IN ('E11', 'O21') OR XML1.MA_BENH_KT REGEXP 'E11|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Cần thận trọng/chống chỉ định cho bệnh nhân Đái tháo đường (E11) hoặc Có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_202",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_202",
    "TEN_QUY_TAC": "[Glucosamin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.64' AND NOT (((XML1.MA_BENH_CHINH REGEXP '^M16(\\\\.|$)|^M17(\\\\.|$)') OR (XML1.MA_BENH_KT REGEXP 'M16|M17') OR (XML1.CHAN_DOAN_VAO REGEXP '(?i)(THOÁI HÓA KHỚP GỐI|THOÁI HOÁ KHỚP GỐI|THOÁI HÓA KHỚP HÁNG|THOÁI HOÁ KHỚP HÁNG|THOAI HOA KHOP GOI|THOAI HOA KHOP HANG)') OR (XML1.CHAN_DOAN_RV REGEXP '(?i)(THOÁI HÓA KHỚP GỐI|THOÁI HOÁ KHỚP GỐI|THOÁI HÓA KHỚP HÁNG|THOÁI HOÁ KHỚP HÁNG|THOAI HOA KHOP GOI|THOAI HOA KHOP HANG)')) AND ((XML1.CHAN_DOAN_VAO REGEXP '(?i)(TRUNG BÌNH\\\\s*[-–]\\\\s*NHẸ|TRUNG BINH\\\\s*[-–]\\\\s*NHE|TRUNG BÌNH|TRUNG BINH|NHẸ|NHE)') OR (XML1.CHAN_DOAN_RV REGEXP '(?i)(TRUNG BÌNH\\\\s*[-–]\\\\s*NHẸ|TRUNG BINH\\\\s*[-–]\\\\s*NHE|TRUNG BÌNH|TRUNG BINH|NHẸ|NHE)')))",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Glucosamin] chỉ được thanh toán khi chẩn đoán phù hợp thoái hóa khớp gối/háng (ICD-10 M17 hoặc M16) và có mô tả mức độ \"trung bình - nhẹ\" trong chẩn đoán vào hoặc chẩn đoán ra.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_203",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_203",
    "TEN_QUY_TAC": "[Glucosamin] Liều chuẩn/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.64' AND (CALC_SL_MOI_NGAY * 250) > 1500",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Liều Glucosamin vượt ngưỡng 1500mg/ngày. Kiểm tra tính hợp lý của phác đồ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_204",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_204",
    "TEN_QUY_TAC": "[Halixol] Liều nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.988' AND XML1.CAN_NANG > 0 AND (CALC_LIEU_MOI_LAN / XML1.CAN_NANG) > 0.6",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Ambroxol vượt liều 0.6mg/kg/lần. Tăng nguy cơ ứ đọng đờm ở trẻ em.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo CALC_LIÊU_MOI_LAN→CALC_LIEU_MOI_LAN",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_205",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_205",
    "TEN_QUY_TAC": "[Hoastex] Check lẻ ống/gói",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.150' AND XML2.SO_LUONG > CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [HÀNH CHÍNH]: Thuốc ho Hoastex dạng ống/gói cấp dư so với quy tắc làm tròn y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_206",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_206",
    "TEN_QUY_TAC": "[Húng chanh, Núc nác, Cineol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.150' AND (XML1.MA_BENH_CHINH IN ('O21') OR XML1.MA_BENH_KT REGEXP 'O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_207",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_207",
    "TEN_QUY_TAC": "[Húng chanh, Núc nác, Cineol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.150' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Húng chanh, Núc nác, Cineol] — Thuốc trong danh mục BV; có thẻ ICD_DRUG nhưng mã ICD chính/kèm không khớp nhóm chỉ định đã khai báo trong Module Mapping. Chỉ định: Hoastex — Viêm hô hấp trên (J06), Viêm phế quản (J20) hoặc Ho (R05).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_208",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_208",
    "TEN_QUY_TAC": "[Hyoscin N – butylbromid] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.698' AND (XML1.MA_BENH_CHINH IN ('N40', 'H40', 'I47') OR XML1.MA_BENH_KT REGEXP 'N40|H40|I47')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho Phì đại tuyến tiền liệt (N40), Glaucom (H40), Nhịp nhanh (I47).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_209",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_209",
    "TEN_QUY_TAC": "[Hyoscin N – butylbromid] Kiểm tra Chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.698' AND XML1.MA_BENH_CHINH NOT IN ('K80', 'N23', 'K58', 'N94.4') AND XML1.MA_BENH_KT NOT LIKE '%K80%' AND XML1.MA_BENH_KT NOT LIKE '%N23%' AND XML1.MA_BENH_KT NOT LIKE '%K58%' AND XML1.MA_BENH_KT NOT LIKE '%N94.4%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(SỎI MẬT|CƠN ĐAU QUẶN THẬN|HỘI CHỨNG RUỘT KÍCH THÍCH|ĐAU BỤNG KINH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Vincopane / Brocizin 20 thanh toán cho Co thắt đường mật, niệu, ruột (K80, N23, K58).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_210",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_210",
    "TEN_QUY_TAC": "[Ibuprofen] Cảnh báo liều/24h nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.37' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_24H / XML1.CAN_NANG) > 40",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Ibuprofen/24h (> 40mg/kg/ngày). Tăng độc tính nghiêm trọng trên thận.",
    "GHI_CHU": "Đã gộp dòng trùng [Ibuprofen] Quá liều/24h",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_211",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_211",
    "TEN_QUY_TAC": "[Ibuprofen] Cảnh báo liều/Lần nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.37' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_1_LAN / XML1.CAN_NANG) > 10",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Ibuprofen/lần cho trẻ em (> 10mg/kg/lần). Dừng y lệnh để tránh xuất huyết tiêu hóa.",
    "GHI_CHU": "Đã gộp dòng trùng [Ibuprofen] Quá liều/Lần",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_212",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_212",
    "TEN_QUY_TAC": "[Ibuprofen] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.37' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'J45', 'R58', 'O21') OR XML1.MA_BENH_KT REGEXP 'K25|K26|J45|R58|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày (K25, K26), Hen phế quản (J45), Xuất huyết (R58) hoặc Có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_213",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_213",
    "TEN_QUY_TAC": "[Ibuprofen] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.37' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(SỐT|ĐAU|VIÊM KHỚP DẠNG THẤP|THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Ibuprofen] — ICD/XML1 không khớp chỉ định. Chỉ định: A.T Ibuprofen Syrup — Sốt, Đau (R50, R52) hoặc Viêm/Thoái hóa khớp (M06, M15).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_214",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_214",
    "TEN_QUY_TAC": "[Imidu 60mg] Tần suất đơn trị",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.479' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Isosorbid-5-mononitrat 60mg giải phóng chậm bắt buộc dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_215",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_215",
    "TEN_QUY_TAC": "[Insulin glargine] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.806' AND (XML1.MA_BENH_CHINH IN ('E16.2') OR XML1.MA_BENH_KT REGEXP 'E16\\.2')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân đang trong cơn Hạ đường huyết (E16.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_216",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_216",
    "TEN_QUY_TAC": "[Insulin glargine] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.806' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐÁI THÁO ĐƯỜNG TÝP 1|ĐÁI THÁO ĐƯỜNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Insulin glargine] — ICD/XML1 không khớp chỉ định. Chỉ định: Basaglar — Đái tháo đường Tuýp 1 và Tuýp 2 (E10, E11).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_217",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_217",
    "TEN_QUY_TAC": "[Isosorbid mononitrat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.479' AND (XML1.MA_BENH_CHINH IN ('I95.1', 'I21', 'R57') OR XML1.MA_BENH_KT REGEXP 'I95\\.1|I21|R57')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hạ huyết áp (I95.1), Nhồi máu cơ tim cấp (I21), Sốc (R57).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_218",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_218",
    "TEN_QUY_TAC": "[Isosorbid mononitrat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.479' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC|SUY TIM|BỆNH TIM THIẾU MÁU|THIẾU MÁU CỤC BỘ CƠ TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Isosorbid mononitrat] — ICD/XML1 không khớp chỉ định. Chỉ định: Imidu 60mg — Đau thắt ngực (I20) hoặc Suy tim (I50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_219",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_219",
    "TEN_QUY_TAC": "[Ivabradin] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.485' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Ivabradin chỉ định dùng 2 lần/ngày (sáng, tối) cùng bữa ăn.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_220",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_220",
    "TEN_QUY_TAC": "[Kali chloride] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.567' AND (XML1.MA_BENH_CHINH IN ('E87.5', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'E87\\.5|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định tuyệt đối cho bệnh nhân Tăng Kali máu (E87.5) hoặc Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_221",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_221",
    "TEN_QUY_TAC": "[Kali Chloride] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.567' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Kali Chloride Proamp cấp dư. Y lệnh: {CALC_SL_MOI_NGAY} ống/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_222",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_222",
    "TEN_QUY_TAC": "[Kali chloride] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.567' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HẠ KALI|RỐI LOẠN KALI)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Kali chloride] — ICD/XML1 không khớp chỉ định. Chỉ định: Potassium Chloride Proamp — Hạ Kali máu (E87.6).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_223",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_223",
    "TEN_QUY_TAC": "[Kẽm gluconat] Cảnh báo liều nhi",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.725' AND XML1.CAN_NANG > 0 AND (CALC_LIEU_MOI_LAN / XML1.CAN_NANG) > 1",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Liều Kẽm lỏng (Bosuzinc) vượt liều bổ sung thông thường cho trẻ em.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo CALC_LIÊU_MOI_LAN→CALC_LIEU_MOI_LAN",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_224",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_224",
    "TEN_QUY_TAC": "[Kẽm gluconat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.725' AND (XML1.MA_BENH_CHINH IN ('E83.0') OR XML1.MA_BENH_KT REGEXP 'E83\\.0')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Rối loạn chuyển hóa kẽm/đồng (E83.0).",
    "GHI_CHU": "Đã gộp dòng trùng [Kẽm gluconat] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_225",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_225",
    "TEN_QUY_TAC": "[Kẽm gluconat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.725' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TIÊU CHẢY|THIẾU KẼM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Kẽm gluconat] — ICD/XML1 không khớp chỉ định. Chỉ định: Bosuzinc — Tiêu chảy (A09) hoặc Bổ sung thiếu Kẽm (E60).",
    "GHI_CHU": "Đã gộp dòng trùng [Kẽm gluconat] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_226",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_226",
    "TEN_QUY_TAC": "[Kẽm siro] Liều nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.724' AND XML1.CAN_NANG > 0 AND (CALC_LIEU_MOI_LAN / XML1.CAN_NANG) > 1",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Liều Kẽm (A.T Zinc) vượt liều bổ sung thông thường cho trẻ em.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo CALC_LIÊU_MOI_LAN→CALC_LIEU_MOI_LAN",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_227",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_227",
    "TEN_QUY_TAC": "[Ketoprofen] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.38' AND (XML1.MA_BENH_CHINH IN ('L20', 'L23', 'K25', 'K26') OR XML1.MA_BENH_KT REGEXP 'L20|L23|K25|K26')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Viêm da dị ứng (L20, L23) hoặc Loét dạ dày (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_228",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_228",
    "TEN_QUY_TAC": "[Ketoprofen] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.39' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐAU|ĐAU LƯNG|ĐAU THẮT LƯNG|ĐAU CỘT SỐNG|MỔ LẤY THAI|SINH MỔ|CHĂM SÓC SAU PHẪU THUẬT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Ketoprofen] — ICD/XML1 không khớp chỉ định. Chỉ định: Fastum Gel — Đau cột sống, Đau cơ, Viêm khớp (M54, M79, M06, T14).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_229",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_229",
    "TEN_QUY_TAC": "[Ketorolac] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.39' AND TONG_LIEU_24H > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Ketorolac (> 90mg/ngày đối với người lớn). Nguy cơ rất cao gây loét/thủng dạ dày và suy thận cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_230",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_230",
    "TEN_QUY_TAC": "[Ketorolac] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.39' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'N18.4', 'N18.5', 'R58', 'O21') OR XML1.MA_BENH_KT REGEXP 'K25|K26|N18\\.4|N18\\.5|R58|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày (K25, K26), Suy thận nặng (N18.4, N18.5), Xuất huyết (R58) hoặc Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_231",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_231",
    "TEN_QUY_TAC": "[Klamentin] Liều nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.155' AND XML1.CAN_NANG > 0 AND (XML2.CALC_SL_MOI_NGAY * 875 / XML1.CAN_NANG) > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Amoxicillin/Clavulanate vượt liều 90mg/kg/ngày. Tăng độc tính gan và tiêu chảy nặng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_232",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_232",
    "TEN_QUY_TAC": "[L-Ornithin - L- aspartat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.747' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_233",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_233",
    "TEN_QUY_TAC": "[L-Ornithin - L-aspartat] Chỉ định (gan cấp/mạn, tăng ammoniac / não gan)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.747' AND ENGINE_RULE_THUOC_233",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: L-ornithin L-aspartat (HEPA-MERZ) chỉ phù hợp khi hồ sơ phản ánh bệnh gan cấp/mạn (viêm gan, xơ gan, gan nhiễm mỡ…), hội chứng tăng ammoniac máu, tiền hôn mê hoặc biến chứng thần kinh do gan (não gan) — theo ICD (K70–K77, G93.4, R79.8…) hoặc chẩn đoán tương đương.",
    "GHI_CHU": "SmPC (tóm tắt): gan cấp/mạn; tăng ammoniac; tiền hôn mê / não gan. Engine: coChiDinhHopLeLOrnithinAspartat233.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_234",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_234",
    "TEN_QUY_TAC": "[Lá sen,Vông nem...] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.135.5' AND (XML1.MA_BENH_CHINH IN ('O21') OR XML1.MA_BENH_KT REGEXP 'O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_235",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_235",
    "TEN_QUY_TAC": "[Lá sen,Vông nem...] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.135.5' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(MẤT NGỦ|RỐI LOẠN GIẤC NGỦ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Lá sen,Vông nem...] — ICD/XML1 không khớp chỉ định. Chỉ định: Mimosa viên an thần — Mất ngủ (F51.0, G47.0).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_236",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_236",
    "TEN_QUY_TAC": "[Lacbiosyn] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.726' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư men vi sinh Lacbiosyn so với y lệnh thực tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_237",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_237",
    "TEN_QUY_TAC": "[Lactobacillus acidophilus] Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.726' AND XML1.MA_BENH_CHINH NOT IN ('A09', 'K59.1', 'R19.7') AND XML1.MA_BENH_KT NOT LIKE '%A09%' AND XML1.MA_BENH_KT NOT LIKE '%K59.1%' AND XML1.MA_BENH_KT NOT LIKE '%R19.7%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TIÊU CHẢY|RỐI LOẠN NHU ĐỘNG RUỘT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Lacbiosyn chỉ được thanh toán cho chẩn đoán Tiêu chảy (A09) hoặc Loạn khuẩn ruột (K59.1, R19.7).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_238",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_238",
    "TEN_QUY_TAC": "[Lactobacillus acidophilus] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.726' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_239",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_239",
    "TEN_QUY_TAC": "[Levocetirizin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.90' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'N18.9') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|N18\\.9')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5, N18.9).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_240",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_240",
    "TEN_QUY_TAC": "[Levocetirizin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.90' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM MŨI DỊ ỨNG|MÀY ĐAY)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Levocetirizin] — ICD/XML1 không khớp chỉ định. Chỉ định: ACRITEL-10 — Viêm mũi dị ứng (J30) hoặc Mày đay (L50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_241",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_241",
    "TEN_QUY_TAC": "[Levofloxacin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.229' AND (XML1.MA_BENH_CHINH IN ('Z88.1', 'G40') OR XML1.MA_BENH_KT REGEXP 'Z88\\.1|G40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Dị ứng Quinolon (Z88.1) hoặc Tiền sử động kinh (G40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_242",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_242",
    "TEN_QUY_TAC": "[Levofloxacin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.229' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM XOANG|VIÊM PHỔI|VIÊM PHẾ QUẢN|VIÊM THẬN BỂ THẬN|VIÊM BÀNG QUANG|VIÊM TUYẾN TIỀN LIỆT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Levofloxacin] — ICD/XML1 không khớp chỉ định. Chỉ định: LEVODHG 500 — Nhiễm khuẩn hô hấp, tiết niệu, tiền liệt tuyến (J01, J15, N10...).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_243",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_243",
    "TEN_QUY_TAC": "[Levofloxacin] Kiểm tra tần suất (Đỉnh diệt khuẩn)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.229' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Levofloxacin diệt khuẩn phụ thuộc nồng độ (Cmax/MIC). Chỉ dùng 1 lần/ngày để tối ưu hóa diệt khuẩn và giảm kháng thuốc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_244",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_244",
    "TEN_QUY_TAC": "[Levothyroxin] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.815' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc nội tiết tuyến giáp bắt buộc dùng 1 lần duy nhất vào buổi sáng trước ăn 30p.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_245",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_245",
    "TEN_QUY_TAC": "[Lidocain] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.12' AND (XML1.MA_BENH_CHINH IN ('I44.1', 'I44.2', 'I44.3') OR XML1.MA_BENH_KT REGEXP 'I44\\.1|I44\\.2|I44\\.3')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định (nếu tiêm bắp/tĩnh mạch) cho bệnh nhân có Block AV độ 2-3 (I44).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_246",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_246",
    "TEN_QUY_TAC": "[Lidocain] Kiểm soát thủ thuật",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.12' AND XML2.SO_LUONG > 5",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Số lượng Lidocain sử dụng cao (> 5 ống). Yêu cầu xác nhận loại thủ thuật.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_247",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_247",
    "TEN_QUY_TAC": "[Lidocain] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.12' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND COUNT_IF(XML3, LOAI_PTTT IN ('1', '2', '3', '4')) == 0",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Lidocain] — Thuốc có trong danh mục nội bộ nhưng trên hồ sơ không có dòng XML3 phẫu thuật/thủ thuật (LOAI_PTTT 1–4) đúng nhóm kỳ vọng khi kê thuốc theo phác đồ xuất toán. Chỉ định: Thuốc Vinlido 200mg chỉ được thanh toán cho chẩn đoán Khám chuyên khoa, Thủ thuật (Z01.8, T81.0).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_248",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_248",
    "TEN_QUY_TAC": "[Lisonorm] Tần suất kéo dài",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.497' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc phối hợp hạ áp Lisonorm chỉ dùng 1 lần duy nhất trong ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_249",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_249",
    "TEN_QUY_TAC": "[Magnesi + nhôm + simethicon] Chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.671' AND XML1.MA_BENH_CHINH NOT IN ('K21', 'K25', 'K26') AND XML1.MA_BENH_KT NOT LIKE '%K21%' AND XML1.MA_BENH_KT NOT LIKE '%K25%' AND XML1.MA_BENH_KT NOT LIKE '%K26%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TRÀO NGƯỢC DẠ DÀY|GERD|LOÉT DẠ DÀY|LOÉT TÁ TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Hamigel-S chỉ được thanh toán cho chẩn đoán Trào ngược (K21) hoặc Loét dạ dày (K25, K26).",
    "GHI_CHU": "Đã gộp dòng trùng [Magnesi+nhôm+simethicon] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_250",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_250",
    "TEN_QUY_TAC": "[Magnesi + nhôm + simethicon] Chống CĐ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.671' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'E83.4') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|E83\\.4')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho bệnh nhân Suy thận nặng (N18.4) hoặc Rối loạn Magne máu (E83.4).",
    "GHI_CHU": "Đã gộp dòng trùng [Magnesi] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_251",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_251",
    "TEN_QUY_TAC": "[Mebilax 15] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.41' AND XML2.TEN_THUOC LIKE '%Mebilax%' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư thuốc Meloxicam 15mg. Y lệnh: {CALC_SL_MOI_NGAY} viên/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_252",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_252",
    "TEN_QUY_TAC": "[Medlon 4] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.775' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Methylprednisolon cấp phát dư so với y lệnh thực tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_253",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_253",
    "TEN_QUY_TAC": "[Meloxicam Inj] Check lẻ ống",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.41' AND XML2.SO_LUONG > CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [HÀNH CHÍNH]: Thuốc Meloxicam tiêm cấp dư so với quy tắc làm tròn ống theo y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_254",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_254",
    "TEN_QUY_TAC": "[Meloxicam] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.41' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'N18.4', 'N18.5', 'I50', 'I21') OR XML1.MA_BENH_KT REGEXP 'K25|K26|N18\\.4|N18\\.5|I50|I21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Loét dạ dày, Suy thận/tim nặng, NMCT (K25, K26, N18.4, I50, I21).",
    "GHI_CHU": "Đã gộp dòng trùng [Meloxicam] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_255",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_255",
    "TEN_QUY_TAC": "[Meloxicam] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.41' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|VIÊM KHỚP DẠNG THẤP|VIÊM CỘT SỐNG DÍNH|VIÊM CỘT SỐNG DÍ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Meloxicam] — ICD/XML1 không khớp chỉ định. Chỉ định: Reumokam / Mebilax 15 — Thoái hóa khớp, Viêm khớp dạng thấp, Cột sống dính khớp (M15, M05, M06, M45).",
    "GHI_CHU": "Đã gộp dòng trùng [Meloxicam] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_256",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_256",
    "TEN_QUY_TAC": "[Mepoly] Check lẻ lọ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.203' AND XML2.SO_LUONG > 1",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Thuốc nhỏ mắt/tai thường cấp 01 lọ/đợt điều trị. Cấp phát > 1 lọ cần lý do lâm sàng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_257",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_257",
    "TEN_QUY_TAC": "[Mesalamin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.748' AND TONG_LIEU_24H > 4000",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Mesalamin (Vinsalamin) vượt ngưỡng 4000mg/ngày. Tăng nguy cơ độc tính trên thận và rối loạn tạo máu.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_258",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_258",
    "TEN_QUY_TAC": "[Mesalamin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.748' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'K72', 'K25') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|K72|K25')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan, thận nặng (N18.4, K72) hoặc Loét dạ dày (K25).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_259",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_259",
    "TEN_QUY_TAC": "[Mesalamin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.748' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(BỆNH CROHN|VIÊM LOÉT ĐẠI TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Mesalamin] — ICD/XML1 không khớp chỉ định. Chỉ định: Vinsalamin 400 — Crohn (K50) hoặc Viêm loét đại tràng (K51).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_260",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_260",
    "TEN_QUY_TAC": "[Metformin XR] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.807' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Dạng XR (giải phóng kéo dài) chỉ uống 1 lần/ngày vào bữa tối để giảm tác dụng phụ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_261",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_261",
    "TEN_QUY_TAC": "[Metformin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.807' AND (XML1.MA_BENH_CHINH IN ('E10', 'N18.4', 'N18.5', 'K72', 'O21') OR XML1.MA_BENH_KT REGEXP 'E10|N18\\.4|N18\\.5|K72|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho ĐTĐ Tuýp 1 (E10), Suy thận/gan nặng (N18.4, K72), Phụ nữ có thai (O21).",
    "GHI_CHU": "Đã gộp 3 dòng trùng [Metformin] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_262",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_262",
    "TEN_QUY_TAC": "[Metformin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.807' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐÁI THÁO ĐƯỜNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Metformin] — ICD/XML1 không khớp chỉ định. Chỉ định: Metformin Stella 850 mg — Đái tháo đường Tuýp 2 (E11).",
    "GHI_CHU": "Đã gộp 3 dòng trùng [Metformin] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_263",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_263",
    "TEN_QUY_TAC": "[Metformin] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.807' AND (CALC_SL_MOI_NGAY * 1000) > 2500",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Metformin vượt ngưỡng an toàn (> 2500mg/ngày). Nguy cơ nhiễm toan lactic.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_264",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_264",
    "TEN_QUY_TAC": "[Metformin] Ngưỡng an toàn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.807' AND (CALC_SL_MOI_NGAY * 850) > 2550",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Metformin vượt 2550mg/ngày. Nguy cơ nhiễm toan Lactic (tử vong cao).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_265",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_265",
    "TEN_QUY_TAC": "[Methylprednisolon] Cảnh báo liều pulse",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.775' AND TONG_LIEU_24H > 1000",
    "CANH_BAO": "⚠️ [KIỂM TRA LÂM SÀNG]: Liều Methylprednisolon > 1000mg/ngày (Pulse therapy). Yêu cầu chỉ định rõ ràng và theo dõi điện giải, huyết áp liên tục.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_266",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_266",
    "TEN_QUY_TAC": "[Methylprednisolon] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.775' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26') OR XML1.MA_BENH_KT REGEXP 'B3[5-9]|B4[0-9]|K25|K26')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Nấm hệ thống (B35-B49) hoặc Loét dạ dày tiến triển (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_267",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_267",
    "TEN_QUY_TAC": "[Methylprednisolon] Chỉ định liệu pháp glucocorticoid (40.775)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.775' AND THUOC_267_VI_PHAM_CHI_DINH(XML1, XML2)",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Methylprednisolon — liệu pháp không đặc hiệu cần chống viêm / giảm miễn dịch: viêm khớp dạng thấp (M05–M06), lupus (M32), viêm mạch (M30–M31), sarcoid (D86), hen (J45), viêm loét đại tràng mạn (K51), thiếu máu tan máu (D55–D59), giảm bạch cầu hạt (D70), dị ứng nặng / phản vệ (L50, T78…), điều trị ung thư (vd. bạch cầu C91–C95, lympho C81–C85, vú C50, tiền liệt tuyến C61), hội chứng thận hư nguyên phát (N04). Cảnh báo khi ICD/chẩn đoán không khớp — không gắn tên biệt dược.",
    "GHI_CHU": "Thiết lập lại theo chỉ định dược lâm sàng; so khớp ICD + CHAN_DOAN_RV/VAO.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_268",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_268",
    "TEN_QUY_TAC": "[Metoclopramid] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.690' AND (XML1.MA_BENH_CHINH IN ('K56', 'K92.2', 'G40') OR XML1.MA_BENH_KT REGEXP 'K56|K92\\.2|G40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho Tắc ruột (K56), Xuất huyết tiêu hóa (K92.2), Tiền sử Động kinh (G40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_269",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_269",
    "TEN_QUY_TAC": "[Metoclopramid] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.690' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(BUỒN NÔN|NÔN)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Metoclopramid] — ICD/XML1 không khớp chỉ định. Chỉ định: Vincomid — Nôn, Buồn nôn (R11).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_270",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_270",
    "TEN_QUY_TAC": "[Metoclopramid] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.690' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Metoclopramid (Vincomid) dùng tối đa 3 lần/ngày để tránh hội chứng ngoại tháp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_271",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_271",
    "TEN_QUY_TAC": "[Metoprolol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.515' AND (XML1.MA_BENH_CHINH IN ('J45', 'I44.1', 'I44.2', 'R00.1') OR XML1.MA_BENH_KT REGEXP 'J45|I44\\.1|I44\\.2|R00\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hen (J45), Block AV (I44.1, I44.2), Nhịp chậm (R00.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_272",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_272",
    "TEN_QUY_TAC": "[Metoprolol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.515' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC|SUY TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Metoprolol] — ICD/XML1 không khớp chỉ định. Chỉ định: Carmotop (25mg/50mg) — Tăng huyết áp (I10), Đau thắt ngực (I20), Suy tim (I50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_273",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_273",
    "TEN_QUY_TAC": "[Metoprolol] Tần suất tim mạch",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.515' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Metoprolol thường dùng tối đa 2 lần/ngày. Tần suất cao hơn cần kiểm tra rối loạn nhịp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_274",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_274",
    "TEN_QUY_TAC": "[Metronidazol] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.212' AND TONG_LIEU_24H > 4000",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Metronidazol vượt quá 4000mg/ngày. Nguy cơ rất cao gây co giật và bệnh lý thần kinh ngoại biên.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_275",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_275",
    "TEN_QUY_TAC": "[Metronidazol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.212' AND (XML1.MA_BENH_CHINH IN ('K72', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'K72|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan nặng (K72) hoặc Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_276",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_276",
    "TEN_QUY_TAC": "[Metronidazol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.212' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(AMÍP|NHIỄM TRÙNG RUỘT|LOÉT DẠ DÀY|LOÉT TÁ TRÀNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Metronidazol] — ICD/XML1 không khớp chỉ định. Chỉ định: Metronidazol Kabi — Lỵ amip (A06), Viêm ruột (A04) hoặc Loét dạ dày H.pylori (K25, K26).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_277",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_277",
    "TEN_QUY_TAC": "[MICEZYM 100] Cấp phát dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.733' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Men vi sinh cấp phát dư so với y lệnh thực tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_278",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_278",
    "TEN_QUY_TAC": "[Mimosa] Kiểm tra tần suất an thần",
    "DIEU_KIEN": "XML2.MA_THUOC == '05C.135.5' AND TAN_SUAT > 2",
    "CANH_BAO": "⚠️ [CẢNH BÁO LÂM SÀNG]: Thuốc an thần Mimosa thường chỉ dùng 1-2 lần/ngày (trước khi ngủ). Dùng quá nhiều lần gây ngủ gà ban ngày, tăng nguy cơ té ngã.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_279",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_279",
    "TEN_QUY_TAC": "[Montelukast] Tần suất chuẩn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.979' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Montelukast (Ingair 10mg) chỉ dùng 1 lần duy nhất trong ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_280",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_280",
    "TEN_QUY_TAC": "[N-Acetylcystein] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.998' AND (XML1.MA_BENH_CHINH IN ('K25', 'K26', 'J45') OR XML1.MA_BENH_KT REGEXP 'K25|K26|J45')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Loét dạ dày (K25, K26) hoặc Hen phế quản có nguy cơ co thắt (J45).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_281",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_281",
    "TEN_QUY_TAC": "[N-Acetylcystein] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.998' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(VIÊM PHẾ QUẢN|BỆNH PHỔI TẮC NGHẼN|COPD|HO)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [N-Acetylcystein] — ICD/XML1 không khớp chỉ định. Chỉ định: ANC — Viêm phế quản, COPD (J20, J44) hoặc Ho đờm (R05).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_282",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_282",
    "TEN_QUY_TAC": "[N-Acetylcystein] Tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.998' AND CALC_TAN_SUAT > 3",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Thuốc long đờm thường dùng 2-3 lần/ngày. Dùng nhiều lần có thể gây co thắt phế quản.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_283",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_283",
    "TEN_QUY_TAC": "[Nabica 8,4%] Kiềm chuyển hóa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.116' AND XML1.MA_BENH_CHINH NOT REGEXP 'E87.2'",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Natri Bicarbonat chỉ nên dùng khi có bằng chứng Toan chuyển hóa (E87.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_284",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_284",
    "TEN_QUY_TAC": "[Naloxon] Cảnh báo tần suất cấp cứu",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.114' AND TAN_SUAT < 1",
    "CANH_BAO": "⚠️ [CẢNH BÁO LÂM SÀNG]: Naloxon có thời gian tác dụng rất ngắn (30-60 phút). Bệnh nhân ngộ độc Opioid có thể tái hôn mê, cần thiết lập tần suất theo dõi/lặp lại liều mỗi 20-30 phút.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Xóa điều kiện KHOANG_CACH_TIEP_THEO (không có trong XML2 QĐ 130). Giữ logic TAN_SUAT < 1 để cảnh báo thiếu lặp liều.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_285",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_285",
    "TEN_QUY_TAC": "[Naloxon] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.114' AND (XML1.MA_BENH_CHINH IN ('I46', 'I44.2') OR XML1.MA_BENH_KT REGEXP 'I46|I44\\.2')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc thận trọng/chống chỉ định tương đối cho bệnh nhân Ngừng tim, Bệnh tim mạch nặng (I46, I44.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_286",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_286",
    "TEN_QUY_TAC": "[Naloxon] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.114' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NGỘ ĐỘC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Naloxon] — ICD/XML1 không khớp chỉ định. Chỉ định: BFS-Naloxone — Ngộ độc Opioid (T40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_287",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_287",
    "TEN_QUY_TAC": "[Natri bicarbonat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.116' AND (XML1.MA_BENH_CHINH IN ('E87.0', 'E87.3', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'E87\\.0|E87\\.3|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tăng Natri máu (E87.0), Kiềm chuyển hóa (E87.3), Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_288",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_288",
    "TEN_QUY_TAC": "[Natri bicarbonat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.116' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NHIỄM TOAN)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Natri bicarbonat] — ICD/XML1 không khớp chỉ định. Chỉ định: BFS-Nabica 8,4% — Toan chuyển hóa (E87.2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_289",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_289",
    "TEN_QUY_TAC": "[Natri montelukast] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.979' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Cần thận trọng và chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_290",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_290",
    "TEN_QUY_TAC": "[Natri montelukast] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.979' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HEN|HEN SUYỄN|HEN PHẾ QUẢN|VIÊM MŨI DỊ ỨNG)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Natri montelukast] — ICD/XML1 không khớp chỉ định. Chỉ định: Ingair 10mg — Hen phế quản (J45) hoặc Viêm mũi dị ứng (J30).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_291",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_291",
    "TEN_QUY_TAC": "[Nebivolol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.517' AND (XML1.MA_BENH_CHINH IN ('J45', 'I44.1', 'I44.2', 'I46', 'I49.5', 'R00.1', 'K72') OR XML1.MA_BENH_KT REGEXP 'J45|I44\\.1|I44\\.2|I46|I49\\.5|R00\\.1|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hen (J45), Block AV (I44), Nhịp chậm (R00.1), Hội chứng Brugada (I49.5), Suy gan (K72).",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Gộp từ dòng 303 - bổ sung I49.5 (Hội chứng Brugada)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_292",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_292",
    "TEN_QUY_TAC": "[Nebivolol] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.517' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|SUY TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Nebivolol] — ICD/XML1 không khớp chỉ định. Chỉ định: Neginol 5 — Tăng huyết áp (I10) hoặc Suy tim (I50).",
    "GHI_CHU": "Đã gộp dòng trùng [Nebivolol] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_293",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_293",
    "TEN_QUY_TAC": "[Nebivolol] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.517' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Neginol 5 (Nebivolol) dùng 1 lần duy nhất trong ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_294",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_294",
    "TEN_QUY_TAC": "[Nefopam] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.47' AND TONG_LIEU_24H > 120",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Acupan (> 120mg/ngày). Tăng nguy cơ ảo giác, nhịp tim nhanh và co giật.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_295",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_295",
    "TEN_QUY_TAC": "[Nefopam] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.47' AND (XML1.MA_BENH_CHINH IN ('G40', 'N40') OR XML1.MA_BENH_KT REGEXP 'G40|N40')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có tiền sử Động kinh (G40) hoặc Bí tiểu do phì đại tuyến tiền liệt (N40).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_296",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_296",
    "TEN_QUY_TAC": "[Nefopam] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.47' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐAU|ĐAU MẠN TÍNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Nefopam] — ICD/XML1 không khớp chỉ định. Chỉ định: Acupan — Đau cấp/mãn tính (R52, G89).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_297",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_297",
    "TEN_QUY_TAC": "[Neostigmin methylsulfat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.832' AND (XML1.MA_BENH_CHINH IN ('J45', 'R06', 'K56') OR XML1.MA_BENH_KT REGEXP 'J45|R06|K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hen phế quản (J45), Suy hô hấp (R06) hoặc Tắc ruột (K56).",
    "GHI_CHU": "Đã gộp dòng trùng [Neostigmin] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_298",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_298",
    "TEN_QUY_TAC": "[Neostigmin methylsulfat] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.832' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(NHƯỢC CƠ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Neostigmin methylsulfat] — ICD/XML1 không khớp chỉ định. Chỉ định: Antigmin — Nhược cơ (G70).",
    "GHI_CHU": "Đã gộp dòng trùng [Neostigmin] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_299",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_299",
    "TEN_QUY_TAC": "[Neostigmin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.832' AND TONG_LIEU_24H > 2.5",
    "CANH_BAO": "⛔ [NGUY HIỂM TỬ VONG]: Liều tiêm Neostigmin (Antigmin) vượt 2.5mg/ngày. Nguy cơ rất cao gây \"Cơn Cholinergic\" (ngừng hô hấp, trụy tim).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_300",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_300",
    "TEN_QUY_TAC": "[Neostigmin] Chốt liều tử vong",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.832' AND (CALC_SL_MOI_NGAY * 0.5) > 2.5",
    "CANH_BAO": "⛔ [NGUY HIỂM TỬ VONG]: Liều Neostigmin vượt 2.5mg/ngày. Nguy cơ liệt cơ hô hấp cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_301",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_301",
    "TEN_QUY_TAC": "[Nifedipin LA] Cảnh báo liều/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.519' AND TONG_LIEU_24H > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Vượt quá liều tối đa của Nifedipin LA (90mg/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_302",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_302",
    "TEN_QUY_TAC": "[Nifedipin LA] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.519' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Nifehexal 30 LA là dạng bào chế giải phóng kéo dài, tuyệt đối chỉ dùng 1 lần/ngày. Dùng nhiều lần gây tụt huyết áp nghiêm trọng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_303",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_303",
    "TEN_QUY_TAC": "[Nifedipin Retard] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.519' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Dạng Retard dùng quá 2 lần/ngày gây rủi ro tụt huyết áp kịch phát.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_304",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_304",
    "TEN_QUY_TAC": "[Nifedipin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.519' AND (XML1.MA_BENH_CHINH IN ('I95.1', 'I21', 'O21') OR XML1.MA_BENH_KT REGEXP 'I95\\.1|I21|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hạ huyết áp tư thế (I95.1), Nhồi máu cơ tim cấp (I21) hoặc Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_305",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_305",
    "TEN_QUY_TAC": "[Nifedipin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.519' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC|TĂNG HUYẾT ÁP THAI KỲ|TIỀN SẢN GIẬT|SẢN GIẬT|TĂNG HUYẾT ÁP THAI|DỌA SINH NON)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Nifedipin] — ICD/XML1 không khớp chỉ định. Chỉ định: Nifehexal 30 LA — Tăng huyết áp vô căn (I10) hoặc Đau thắt ngực (I20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_306",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_306",
    "TEN_QUY_TAC": "[Pancres] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.740' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc tiêu hóa Pancres cấp phát dư. Y lệnh: {CALC_SL_MOI_NGAY} viên/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_307",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_307",
    "TEN_QUY_TAC": "[Paracetamol 150] Liều nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND XML2.TEN_THUOC LIKE '%150%' AND XML1.CAN_NANG > 0 AND (CALC_LIEU_MOI_LAN / XML1.CAN_NANG) > 15",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Efferalgan 150mg vượt liều 15mg/kg/lần. Nguy cơ ngộ độc gan ở trẻ em.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo CALC_LIÊU_MOI_LAN→CALC_LIEU_MOI_LAN",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_308",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_308",
    "TEN_QUY_TAC": "[Paracetamol 80] Liều nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND XML2.TEN_THUOC LIKE '%80%' AND XML1.CAN_NANG > 0 AND (CALC_LIEU_MOI_LAN / XML1.CAN_NANG) > 15",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Efferalgan 80mg vượt liều 15mg/kg/lần.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo CALC_LIÊU_MOI_LAN→CALC_LIEU_MOI_LAN",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_309",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_309",
    "TEN_QUY_TAC": "[Paracetamol] Cảnh báo liều/Lần",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_1_LAN / XML1.CAN_NANG) > 15",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Paracetamol/lần (> 15mg/kg/lần). Dừng y lệnh để tránh suy gan cấp.",
    "GHI_CHU": "Đã gộp dòng trùng [Paracetamol] Liều/Lần",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_310",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_310",
    "TEN_QUY_TAC": "[Paracetamol] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND (XML1.MA_BENH_CHINH IN ('K72') OR XML1.MA_BENH_KT REGEXP 'K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan nặng (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_311",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_311",
    "TEN_QUY_TAC": "[Paracetamol] Chỉ định giảm đau / hạ sốt (40.48)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND THUOC_311_VI_PHAM_CHI_DINH(XML1, XML2)",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Paracetamol (40.48) có tác dụng giảm đau, hạ sốt — cần gắn bối cảnh lâm sàng phù hợp (sốt/đau đầu, đau răng, cảm cúm, sau tiêm ngừa/nhổ răng, đau hành kinh, đau họng, đau cơ–xương–khớp, phối hợp điều trị triệu chứng…). ICD gợi ý: R50–R52, R05–R07, R09; M15–M25, M54, M60–M79; J00–J11; K04–K05, K08; N92–N94; H65–H66; Z25 (tiêm chủng); G43–G44; Y59 — hoặc mô tả rõ trong chẩn đoán.",
    "GHI_CHU": "Viết lại theo chỉ định dược lâm sàng (giảm đau/hạ sốt, thay salicylat); không gắn tên biệt dược. So khớp ICD + CHAN_DOAN_RV trong engine.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_312",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_312",
    "TEN_QUY_TAC": "[Paracetamol] Kiểm tra tần suất an toàn",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.48' AND TAN_SUAT > 6",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Khoảng cách dùng Paracetamol tối thiểu là 4 giờ. Tần suất > 6 lần/ngày vi phạm an toàn sử dụng thuốc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_313",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_313",
    "TEN_QUY_TAC": "[Paracetamol/Codein] Liều Codein",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.50' AND (CALC_SL_MOI_NGAY * 15) > 240",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Codein vượt ngưỡng 240mg/ngày. Tăng nguy cơ ức chế hô hấp nghiêm trọng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_314",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_314",
    "TEN_QUY_TAC": "[Perindopril + amlodipin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.521' AND (XML1.MA_BENH_CHINH IN ('I95.1', 'O21', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'I95\\.1|O21|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Hạ huyết áp (I95.1), Phụ nữ có thai (O21), hoặc Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_315",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_315",
    "TEN_QUY_TAC": "[Perindopril + amlodipin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.521' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Perindopril + amlodipin] — ICD/XML1 không khớp chỉ định. Chỉ định: VT-Amlopril — Tăng huyết áp vô căn (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_316",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_316",
    "TEN_QUY_TAC": "[Perindopril + Amlodipin] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.521' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: VT-Amlopril (thuốc phối hợp hạ áp) có thời gian bán thải dài, bắt buộc chỉ uống 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_317",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_317",
    "TEN_QUY_TAC": "[Piracetam] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.576' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'I60') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|I60')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5) hoặc Xuất huyết dưới nhện (I60).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_318",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_318",
    "TEN_QUY_TAC": "[Piracetam] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.576' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(SA SÚT TRÍ TUỆ|THIẾU MÁU NÃO THOÁNG QUA|CHÓNG MẶT|RỐI LOẠN TIỀN ĐÌNH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Piracetam] — ICD/XML1 không khớp chỉ định. Chỉ định: Maxxviton 1200 — Suy giảm nhận thức (F03), Thiếu máu não (G45), Chóng mặt (H81).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_319",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_319",
    "TEN_QUY_TAC": "[Piracetam] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.576' AND (CALC_SL_MOI_NGAY * 1200) > 12000",
    "CANH_BAO": "⛔ [QUÁ LIỀU]: Liều Piracetam vượt ngưỡng 12g/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_320",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_320",
    "TEN_QUY_TAC": "[Protease +Amylase + Lipase] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.740' AND (XML1.MA_BENH_CHINH IN ('K85') OR XML1.MA_BENH_KT REGEXP 'K85')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Viêm tụy cấp (K85).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_321",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_321",
    "TEN_QUY_TAC": "[Men tụy] Chỉ định: suy/viêm tụy mạn, xơ nang, sau mổ tụy, kém hấp thu/ỉa mỡ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.740' AND ENGINE_RULE_THUOC_321",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Men tụy (Pancreatin) phù hợp khi suy tụy / suy tụy kèm viêm tụy mạn / viêm tụy mạn; trợ tiêu hóa sau cắt tụy hoặc tắc ống tụy, sau mổ cắt tụy, sau nối dạ dày–ruột; điều trị xơ nang tụy (E84); phân mỡ / kém hấp thu (K90, R19.5…). Kiểm tra ICD và chẩn đoán lâm sàng.",
    "GHI_CHU": "Engine: THUOC_321 — coChiDinhHopLeMenTuyPancreatin321 (E84, K86, K90, K91, R19.5, Z90.89… + từ khóa). THUOC_320 vẫn chống chỉ định K85 cấp.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_322",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_322",
    "TEN_QUY_TAC": "[Racecadotril] Cảnh báo liều/Lần nhi khoa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.732' AND XML1.CAN_NANG > 0 AND (TONG_LIEU_1_LAN / XML1.CAN_NANG) > 1.5",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Racecadotril (Soshydra) liều chuẩn là 1.5mg/kg/lần. Quá liều có thể gây táo bón thứ phát.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_323",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_323",
    "TEN_QUY_TAC": "[Racecadotril] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.732' AND (XML1.MA_BENH_CHINH IN ('K72') OR XML1.MA_BENH_KT REGEXP 'K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan nặng (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_324",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_324",
    "TEN_QUY_TAC": "[Racecadotril] Tiêu chảy cấp, >3 tháng, bù nước đường uống (trẻ em)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.732' AND ENGINE_RULE_THUOC_324",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Racecadotril — bổ sung điều trị triệu chứng tiêu chảy cấp ở trẻ trên 3 tháng và trẻ em, kèm bù nước đường uống (ORS); có thể dùng bổ sung khi đã điều trị nguyên nhân. Kiểm tra tuổi (tối thiểu 90 ngày nếu có TUOI_NGAY), ICD/chẩn đoán tiêu chảy (A04, A08, A09, R19.7…) và ORS hoặc ghi nhận trên hồ sơ với trẻ em dưới 18 tuổi.",
    "GHI_CHU": "Engine: THUOC_324 — coChiDinhHopLeRacecadotril324. THUOC_322 liều/kg; THUOC_323 K72; THUOC_325 tần suất.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_325",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_325",
    "TEN_QUY_TAC": "[Racecadotril] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.732' AND TAN_SUAT > 3",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Racecadotril dùng tối đa 3 lần/ngày (chia đều theo các bữa ăn).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_326",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_326",
    "TEN_QUY_TAC": "[Reumokam] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.41' AND XML2.TEN_THUOC LIKE '%Reumokam%' AND XML2.SO_LUONG > CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Meloxicam tiêm cấp dư. Y lệnh: {CALC_SL_MOI_NGAY} ống/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_327",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_327",
    "TEN_QUY_TAC": "[Rosuvastatin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND TONG_LIEU_24H > 40",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Rosuvastatin (> 40mg/ngày). Tăng đột biến nguy cơ tiêu cơ vân cấp và suy thận.",
    "GHI_CHU": "Đã gộp dòng trùng [Rosuvastatin] liều tối đa/24h",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_328",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_328",
    "TEN_QUY_TAC": "[Rosuvastatin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND (XML1.MA_BENH_CHINH IN ('K71', 'K72', 'O21', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'K71|K72|O21|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy gan/thận nặng, Phụ nữ có thai (K71, K72, O21, N18.4).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_329",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_329",
    "TEN_QUY_TAC": "[Rosuvastatin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG CHOLESTEROL|RỐI LOẠN LIPID|TĂNG TRIGLYCERID|TĂNG LIPID MÁU HỖN HỢP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Rosuvastatin] — ICD/XML1 không khớp chỉ định. Chỉ định: Rosuvastatin — Rối loạn Lipoprotein máu (E78).",
    "GHI_CHU": "Đối chiếu T3_chuagui OP26005115: MA_BENH_KT=E78;... phải khớp mã E78 không phụ (token), không chỉ E78.0–E78.9 trong chuỗi LIKE.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_330",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_330",
    "TEN_QUY_TAC": "[Rosuvastatin] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Rosuvastatin (Courtois) có thời gian bán thải dài, chỉ dùng duy nhất 1 lần/ngày.",
    "GHI_CHU": "Đã gộp dòng trùng [Rosuvastatin] tần suất",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_331",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_331",
    "TEN_QUY_TAC": "[Rotundin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(MẤT NGỦ|RỐI LOẠN GIẤC NGỦ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Rotundin] — ICD/XML1 không khớp chỉ định. Chỉ định: Rotundin 60 / Gliclada — Mất ngủ (G47) hoặc Đái tháo đường Tuýp 2 (E11).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_332",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_332",
    "TEN_QUY_TAC": "[Rotundin] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND XML2.TEN_THUOC LIKE '%Rotundin%' AND TONG_LIEU_24H > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều Rotundin vượt 90mg/ngày. Ức chế thần kinh trung ương quá mức, rối loạn nhịp tim.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_333",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_333",
    "TEN_QUY_TAC": "[Rotundin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.937' AND (XML1.MA_BENH_CHINH IN ('O21', 'K72', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'O21|K72|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Có thai (O21), Suy gan/thận nặng (K72, N18.4) hoặc ĐTĐ Tuýp 1 (E10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_334",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_334",
    "TEN_QUY_TAC": "[Ryzonal] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.829' AND (CALC_SL_MOI_NGAY * 50) > 150",
    "CANH_BAO": "⛔ [QUÁ LIỀU]: Eperison vượt 150mg/ngày. Tăng nguy cơ sốc phản vệ và yếu cơ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_335",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_335",
    "TEN_QUY_TAC": "[Saccharomyces boulardii] Chống CĐ",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.733' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_336",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_336",
    "TEN_QUY_TAC": "[Saccharomyces boulardii] Kiểm tra",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.733' AND XML1.MA_BENH_CHINH NOT IN ('A09', 'K59.1') AND XML1.MA_BENH_KT NOT LIKE '%A09%' AND XML1.MA_BENH_KT NOT LIKE '%K59.1%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TIÊU CHẢY|RỐI LOẠN NHU ĐỘNG RUỘT)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc MICEZYM 100 chỉ được thanh toán cho chẩn đoán Tiêu chảy cấp (A09), Loạn khuẩn (K59.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_337",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_337",
    "TEN_QUY_TAC": "[Salmeterol + Fluticason] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.982' AND (XML1.MA_BENH_CHINH IN ('I47', 'I48') OR XML1.MA_BENH_KT REGEXP 'I47|I48')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có Nhịp nhanh kịch phát hoặc Rung nhĩ (I47, I48).",
    "GHI_CHU": "Đã gộp dòng trùng [Salmeterol+Fluticason] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_338",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_338",
    "TEN_QUY_TAC": "[Seretide / Salmeterol + Fluticason] Chỉ định SmPC (hen ĐDK hồi phục, COPD duy trì)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.982' AND ENGINE_RULE_THUOC_338",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Seretide (Salmeterol+Fluticasone) theo SmPC chỉ trong điều trị hen — bệnh tắc nghẽn đường dẫn khí có hồi phục (J45, từ 4 tuổi; các tình huống duy trì/điều chỉnh theo ICS, LABA, SABA PRN) hoặc COPD — điều trị duy trì tắc nghẽn đường dẫn khí và giảm kịch phát (J44). Cần mã/chẩn đoán tương ứng trên hồ sơ.",
    "GHI_CHU": "SmPC (tóm tắt): Hen — BN kiểm soát tốt với ICS+LABA dài; BN còn triệu chứng khi ICS hít; BN chưa kiểm soát đủ với ICS+SABA khi cần. COPD — duy trì tắc nghẽn ĐDK, giảm kịch phát (chứng minh lâm sàng). Engine: coChiDinhHopLeIcsLabaJ45J44. Đã gộp dòng trùng [Salmeterol+Fluticason] ICD-10.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_339",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_339",
    "TEN_QUY_TAC": "[Sắt (III)] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.433' AND (XML1.MA_BENH_CHINH IN ('D56', 'D57', 'E83.1') OR XML1.MA_BENH_KT REGEXP 'D56|D57|E83\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho bệnh nhân Thalassemia (D56), Ứ sắt (E83.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_340",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_340",
    "TEN_QUY_TAC": "[Sắt (III)] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.433' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU MÁU THIẾU SẮT|SUY DINH DƯỠNG THAI KỲ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Sắt (III)] — ICD/XML1 không khớp chỉ định. Chỉ định: Ferovin — Thiếu máu thiếu sắt (D50), Thiếu dinh dưỡng thai kỳ (O25).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_341",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_341",
    "TEN_QUY_TAC": "[Sắt fumarat + Acid Folic] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.429' AND (XML1.MA_BENH_CHINH IN ('D56', 'D57', 'E83.1') OR XML1.MA_BENH_KT REGEXP 'D56|D57|E83\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Thalassemia (D56, D57) hoặc Tình trạng ứ sắt (E83.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_342",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_342",
    "TEN_QUY_TAC": "[Sắt fumarat + Acid Folic] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.429' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU MÁU THIẾU SẮT|SUY DINH DƯỠNG THAI KỲ)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Sắt fumarat + Acid Folic] — ICD/XML1 không khớp chỉ định. Chỉ định: Prodertonic — Thiếu máu thiếu sắt (D50) hoặc Bổ sung thai kỳ (O25).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_343",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_343",
    "TEN_QUY_TAC": "[Seretide] Tần suất hít",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.982' AND CALC_TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Seretide dùng định kỳ 2 lần/ngày. Không dùng quá tần suất này để tránh độc tính tim mạch.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_344",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_344",
    "TEN_QUY_TAC": "[Simethicon] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.750' AND (XML1.MA_BENH_CHINH IN ('K56') OR XML1.MA_BENH_KT REGEXP 'K56')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Tắc ruột (K56).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_345",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_345",
    "TEN_QUY_TAC": "[Simethicon] Chỉ định lâm sàng (đầy hơi, khó tiêu, GERD, phá bọt nội soi/XQ)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.750' AND ENGINE_RULE_THUOC_345",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Simethicon chỉ phù hợp khi có chỉ định/bối cảnh: giảm đầy hơi và khó chịu do thừa hơi (vd. R14), khó tiêu chức năng (K30), trào ngược dạ dày–thực quản (K21…), hoặc bệnh lý/ thủ thuật nội soi — chụp X-quang đường tiêu hóa cần chất phá bọt; thường phối hợp thuốc kháng acid trong rối loạn tiêu hóa. Kiểm tra ICD/chẩn đoán lâm sàng và dịch vụ liên quan trên hồ sơ.",
    "GHI_CHU": "Engine: THUOC_345 — coChiDinhHopLeSimethiconTheoHc (ICD R12/R14/R101, K21, K30, K318, Z018; từ khóa chẩn đoán; XML3 nội soi/chụp tiêu hóa).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_346",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_346",
    "TEN_QUY_TAC": "[Simethicon] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.750' AND TAN_SUAT > 4",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Simethicon (Simecol) dùng tối đa 4 lần/ngày (sau các bữa ăn và trước khi đi ngủ).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_347",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_347",
    "TEN_QUY_TAC": "[Spinolac fort] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.661' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng thuốc lợi tiểu phối hợp kê đơn không khớp với hướng dẫn chi tiết.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_348",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_348",
    "TEN_QUY_TAC": "[Stresam] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.934' AND (CALC_SL_MOI_NGAY * 50) > 200",
    "CANH_BAO": "⛔ [SAI LIỀU]: Etifoxin dùng tối đa 4 viên (200mg)/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_349",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_349",
    "TEN_QUY_TAC": "[Sulfoguaiacol + Codein] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.991' AND (XML1.MA_BENH_CHINH IN ('J45', 'R06', 'K72') OR XML1.MA_BENH_KT REGEXP 'J45|R06|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định cho bệnh nhân Hen phế quản (J45), Suy hô hấp (R06) hoặc Suy gan (K72).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_350",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_350",
    "TEN_QUY_TAC": "[Sulfoguaiacol + Codein] Kiểm tra ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.991' AND XML1.MA_BENH_CHINH NOT IN ('R05', 'J06') AND XML1.MA_BENH_KT NOT LIKE '%R05%' AND XML1.MA_BENH_KT NOT LIKE '%J06%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HO|VIÊM ĐƯỜNG HÔ HẤP TRÊN|VIÊM HỌNG|NHIỄM TRÙNG HÔ HẤP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Dorocodon chỉ được thanh toán cho chẩn đoán Ho khan, Viêm hô hấp (R05, J06).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_351",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_351",
    "TEN_QUY_TAC": "[Telmisartan + HCTZ] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.527' AND TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc phối hợp Telmisartan/HCTZ chỉ uống 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_352",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_352",
    "TEN_QUY_TAC": "[Telmisartan + hydroclorothiazid] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.527' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'O21', 'E87.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|O21|E87\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5), Phụ nữ có thai (O21) hoặc Tăng Kali máu (E87.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_353",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_353",
    "TEN_QUY_TAC": "[Telmisartan + hydroclorothiazid] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.527' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Telmisartan + hydroclorothiazid] — ICD/XML1 không khớp chỉ định. Chỉ định: Telmisartan 80 mg and Hydrochlorothiazide 12.5mg Tablets — Tăng huyết áp vô căn (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_354",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_354",
    "TEN_QUY_TAC": "[Telmisartan] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.526' AND (XML1.MA_BENH_CHINH IN ('O21', 'N18.4', 'N18.5', 'E87.5') OR XML1.MA_BENH_KT REGEXP 'O21|N18\\.4|N18\\.5|E87\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Phụ nữ có thai (O21), Suy thận nặng (N18.4, N18.5), Tăng Kali máu (E87.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_355",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_355",
    "TEN_QUY_TAC": "[Telmisartan] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.526' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Telmisartan] — ICD/XML1 không khớp chỉ định. Chỉ định: SaVi Telmisartan 40 — Tăng huyết áp vô căn (I10).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_356",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_356",
    "TEN_QUY_TAC": "[Telmisartan] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.526' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Telmisartan 40mg dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_357",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_357",
    "TEN_QUY_TAC": "[Terbutalin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.983' AND (XML1.MA_BENH_CHINH IN ('I47', 'I48') OR XML1.MA_BENH_KT REGEXP 'I47|I48')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân có Rối loạn nhịp tim (I47, I48).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_358",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_358",
    "TEN_QUY_TAC": "[Terbutalin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.983' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HEN|HEN SUYỄN|HEN PHẾ QUẢN|BỆNH PHỔI TẮC NGHẼN|COPD)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Terbutalin] — ICD/XML1 không khớp chỉ định. Chỉ định: Vinterlin — Hen phế quản (J45) hoặc COPD (J44).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_359",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_359",
    "TEN_QUY_TAC": "[Terbutalin] Tần suất xịt/tiêm",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.983' AND CALC_TAN_SUAT > 4",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Tần suất dùng Terbutalin cao. Theo dõi nguy cơ hạ kali máu và nhịp tim nhanh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_360",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_360",
    "TEN_QUY_TAC": "[Thiamazol] Ngưỡng liều cường giáp",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.817' AND (CALC_SL_MOI_NGAY * 10) > 60",
    "CANH_BAO": "⛔ [QUÁ LIỀU]: Liều Thiamazol vượt quá 60mg/ngày. Tăng nguy cơ độc tính trên tủy xương.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_361",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_361",
    "TEN_QUY_TAC": "[Trimetazidin MR] Kiểm tra tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.481' AND TAN_SUAT > 2",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Vastec 35 MR là dạng bào chế giải phóng có kiểm soát, chỉ dùng tối đa 2 lần/ngày (sáng, tối).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_362",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_362",
    "TEN_QUY_TAC": "[Trimetazidin] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.481' AND (XML1.MA_BENH_CHINH IN ('G20', 'G25', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'G20|G25|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Parkinson (G20, G25) hoặc Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_363",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_363",
    "TEN_QUY_TAC": "[Trimetazidin] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.481' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐAU THẮT NGỰC|CƠN ĐAU THẮT NGỰC)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Trimetazidin] — ICD/XML1 không khớp chỉ định. Chỉ định: Vastec 35 MR — Đau thắt ngực (I20).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_364",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_364",
    "TEN_QUY_TAC": "[Ursodeoxycholic acid] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.756' AND (XML1.MA_BENH_CHINH IN ('K81', 'K83.0', 'O21') OR XML1.MA_BENH_KT REGEXP 'K81|K83\\.0|O21')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho Viêm túi mật cấp (K81), Viêm đường mật cấp (K83.0) hoặc Phụ nữ có thai (O21).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_365",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_365",
    "TEN_QUY_TAC": "[Ursodeoxycholic acid] Chỉ định SmPC (sỏi mật, PBC/ứ mật, béo phì, CF 6–18…)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.756' AND ENGINE_RULE_THUOC_365",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Acid ursodeoxycholic chỉ phù hợp khi hồ sơ phản ánh chỉ định: tan sỏi mật cản quang (không vôi hóa, bối cảnh không mổ/nguy cơ mổ); phòng sỏi khi béo phì/giảm cân nhanh; PBC/xơ gan nguyên phát; gan ứ mật; rối loạn gan–mật do xơ nang (6–18 tuổi); viêm đường mật nguyên phát; bất thường cholesterol mật/thoát dịch — theo ICD (K80, K71, K74.3–6, K76.8, E66, E84, K83.1–9…) hoặc chẩn đoán tương đương.",
    "GHI_CHU": "Không dùng K83.0 cấp (xem THUOC_364). Engine: coChiDinhHopLeUrsodeoxycholic365, laDuoi6Den18HoSo cho E84/xơ nang.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_366",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_366",
    "TEN_QUY_TAC": "[Valsartan + Hydroclorothiazid] C.C.Định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.528' AND (XML1.MA_BENH_CHINH IN ('O21', 'N18.4', 'N18.5', 'E87.5') OR XML1.MA_BENH_KT REGEXP 'O21|N18\\.4|N18\\.5|E87\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Chống chỉ định Phụ nữ có thai (O21), Suy thận nặng, Tăng Kali máu (E87.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_367",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_367",
    "TEN_QUY_TAC": "[Valsartan] Cảnh báo liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.528' AND TONG_LIEU_24H > 320",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Liều tối đa của Valsartan (ValtimAPC) là 320mg/ngày. Tăng nguy cơ hạ huyết áp và suy thận cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_368",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_368",
    "TEN_QUY_TAC": "[Valsartan] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.528' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|SUY TIM)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Valsartan] — ICD/XML1 không khớp chỉ định. Chỉ định: ValtimAPC 80 — Tăng huyết áp (I10) hoặc Suy tim (I50).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_369",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_369",
    "TEN_QUY_TAC": "[Valsartan+HCTZ] Tần suất",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.528' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⛔ [SAI PHÁC ĐỒ]: Thuốc phối hợp hạ áp Valsgim-H 80 chỉ dùng 1 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_370",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_370",
    "TEN_QUY_TAC": "[Vitamin 3B] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1050' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI NHẬP LIỆU]: Kiểm tra lại số lượng Vitamin B1+B6+B12.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_371",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_371",
    "TEN_QUY_TAC": "[Vitamin B1 + B6 + B12] Chống chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1050' AND (XML1.MA_BENH_CHINH IN ('D68', 'N18.4', 'N18.5') OR XML1.MA_BENH_KT REGEXP 'D68|N18\\.4|N18\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Rối loạn đông máu (D68) hoặc Suy thận nặng (N18.4, N18.5).",
    "GHI_CHU": "Đã gộp dòng trùng [Vitamin B1+B6+B12] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_372",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_372",
    "TEN_QUY_TAC": "[Vitamin B1 + B6 + B12] Kiểm tra Chỉ định",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1050' AND XML1.MA_BENH_CHINH NOT IN ('E51', 'E53', 'G62') AND XML1.MA_BENH_KT NOT LIKE '%E51%' AND XML1.MA_BENH_KT NOT LIKE '%E53%' AND XML1.MA_BENH_KT NOT LIKE '%G62%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU VITAMIN B1|THIẾU VITAMIN B|BỆNH ĐA DÂY THẦN KINH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc Vit B1-B6-B12 chỉ thanh toán cho chẩn đoán Viêm đa dây thần kinh (G62) hoặc Thiếu Vitamin (E51).",
    "GHI_CHU": "Đã gộp dòng trùng [Vitamin B1+B6+B12] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_373",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_373",
    "TEN_QUY_TAC": "[Vitamin B6 + magnesi lactat] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1055' AND (XML1.MA_BENH_CHINH IN ('N18.4', 'N18.5', 'E83.5') OR XML1.MA_BENH_KT REGEXP 'N18\\.4|N18\\.5|E83\\.5')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Suy thận nặng (N18.4, N18.5) hoặc Tăng Calci huyết (E83.5).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_374",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_374",
    "TEN_QUY_TAC": "[Vitamin B6 + magnesi lactat] Thiếu magnesi (đơn độc hoặc kết hợp)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1055' AND ENGINE_RULE_THUOC_374",
    "CANH_BAO": "⛔ [CHỈ ĐỊNH]: Magnesi B6 dùng khi điều trị thiếu magnesi đơn độc hoặc kết hợp (vd. E61.2 thiếu magnesi, E83.4 rối loạn chuyển hóa magnesi, E61.8 thiếu đa chất; triệu chứng kèm R25.2 nếu liên quan). Kiểm tra ICD và chẩn đoán lâm sàng.",
    "GHI_CHU": "Engine: THUOC_374 — coChiDinhHopLeMagnesiB6374. THUOC_373 chống chỉ định N18.4/5, E83.5.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_375",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_375",
    "TEN_QUY_TAC": "[Vitamin C 1000] Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1057' AND (CALC_SL_MOI_NGAY * 1000) > 2000",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Liều Vitamin C > 2000mg/ngày tăng nguy cơ sỏi thận và rối loạn tiêu hóa.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_376",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_376",
    "TEN_QUY_TAC": "[Vitamin C 1000] Nhất quán y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1057' AND XML2.SO_LUONG != (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [LỖI DỮ LIỆU]: Số lượng Vitamin C kê đơn và hướng dẫn chi tiết không khớp nhau.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_377",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_377",
    "TEN_QUY_TAC": "[Vitamin C] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1057' AND (XML1.MA_BENH_CHINH IN ('N20', 'E83.1') OR XML1.MA_BENH_KT REGEXP 'N20|E83\\.1')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc chống chỉ định cho bệnh nhân Sỏi thận (N20) hoặc Rối loạn chuyển hóa Sắt (E83.1).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_378",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_378",
    "TEN_QUY_TAC": "[Vitamin C] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1057' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU VITAMIN C|THIẾU MÁU)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Vitamin C] — ICD/XML1 không khớp chỉ định. Chỉ định: Kingdomin vita C — Scorbut (E54) hoặc Thiếu máu (D64).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_379",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_379",
    "TEN_QUY_TAC": "[Vitamin E] Chống chỉ định lâm sàng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1061' AND (XML1.MA_BENH_CHINH IN ('D68', 'K72') OR XML1.MA_BENH_KT REGEXP 'D68|K72')",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Thuốc cần thận trọng ở bệnh nhân Rối loạn đông máu (D68) hoặc Suy gan nặng (K72).",
    "GHI_CHU": "Đã gộp dòng trùng [Vitamin E] Chống chỉ định",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_380",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_380",
    "TEN_QUY_TAC": "[Vitamin E] Kiểm tra cấp dư",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1061' AND XML2.SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Cấp dư Vitamin E so với phác đồ điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_381",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_381",
    "TEN_QUY_TAC": "[Vitamin E] Kiểm tra Chỉ định ICD-10",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1061' AND CO_THUOC_TRONG_DM_BV(XML2.MA_THUOC) AND CO_CO_DONG_MAPPING_ICD_THUOC(XML2.MA_THUOC) AND NOT CO_ICD_KHOP_MAPPING_THUOC(XML2.MA_THUOC) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THIẾU VITAMIN|THIẾU KẼM|VÔ SINH)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: [Vitamin E] — ICD/XML1 không khớp chỉ định. Chỉ định: Incepavit 400 Capsule — Thiếu hụt dinh dưỡng (E56, E60) hoặc Hỗ trợ vô sinh (N97).",
    "GHI_CHU": "Đã gộp dòng trùng [Vitamin E] ICD-10",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_382",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_382",
    "TEN_QUY_TAC": "[Vitamin E] Tần suất dùng",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.1061' AND CALC_TAN_SUAT > 1",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Vitamin E thường chỉ dùng 1 lần/ngày. Tăng tần suất không tăng hấp thu mà tăng nguy cơ rối loạn tiêu hóa.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_383",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_383",
    "TEN_QUY_TAC": "[Zentanil] Tần suất tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.685' AND CALC_TAN_SUAT > 4",
    "CANH_BAO": "⚠️ [CẢNH BÁO]: Acetyl Leucin dạng lọ thường dùng cho cơn chóng mặt nặng, tối đa 4 lần/ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_384",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_384",
    "TEN_QUY_TAC": "Acupan: Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.47' AND (XML2.SO_LUONG * 20) > 120",
    "CANH_BAO": "⛔ [QUÁ LIỀU]: Tổng liều Nefopam vượt 120mg/24h. Tăng rủi ro co giật và ảo giác.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_385",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_385",
    "TEN_QUY_TAC": "Albumin - Thiếu chỉ số xét nghiệm",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.1011' AND COUNT_IF(XML3, MA_DICH_VU IN ('XN_ALBUMIN','XN_PROTEIN')) == 0",
    "CANH_BAO": "⛔ [VBHN 15]: Albumin chỉ thanh toán khi nồng độ Albumin máu < 25g/L hoặc Protein máu < 50g/L (trừ các trường hợp cấp cứu đặc biệt).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_386",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_386",
    "TEN_QUY_TAC": "Albumin vs Sốc giảm thể tích",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.1011' AND XML1.MA_BENH_CHINH == 'R57.1' AND XML1.T_TONGCHI_BV > 5000000",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Albumin dùng trong sốc giảm thể tích là chỉ định đắt tiền. Cần rà soát y văn minh chứng khi nồng độ Protein không thấp.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo MA_BEN_CHINH→MA_BENH_CHINH (thiếu chữ H)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_387",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_387",
    "TEN_QUY_TAC": "Amoxicilin/Clavulanic: Liều Nhi",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.155' AND XML1.CAN_NANG > 0 AND (XML2.CALC_SL_MOI_NGAY * 875 / XML1.CAN_NANG) > 90",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Amoxicillin trẻ em (> 90mg/kg/ngày). Tăng độc tính gan và tiêu chảy.",
    "GHI_CHU": "2026-04-09: Tắt trùng THUOC_231 — bản cũ dùng XML2.SO_LUONG×250 (SO_LUONG là tổng cấp phát, không phải/ngày) gây báo động giả. Bật lại chỉ nếu cần mã THUOC_387 riêng; điều kiện đúng: XML2.CALC_SL_MOI_NGAY×875.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_388",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_388",
    "TEN_QUY_TAC": "Azithromycin: Liều Nhi (mg/kg)",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND XML1.CAN_NANG > 0 AND (XML2.SO_LUONG * 500 / XML1.CAN_NANG) > 10",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Quá liều Azithromycin cho trẻ em (> 10mg/kg/ngày). Kiểm tra lại cân nặng bệnh nhân.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_389",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_389",
    "TEN_QUY_TAC": "Azithromycin: Nhất quán Y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.219' AND XML2.SO_LUONG != (XML2.TAN_SUAT * XML2.SL_MOI_LAN)",
    "CANH_BAO": "⚠️ [LỖI NHẬP LIỆU]: Số lượng Zaromax 500 kê đơn không tương thích với hướng dẫn dùng thuốc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_390",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_390",
    "TEN_QUY_TAC": "Beta-blocker vs Hen/COPD",
    "DIEU_KIEN": "XML2.MA_NHOM == 'BETA_BLOCKER' AND XML1.MA_BENH_CHINH IN ('J44','J45')",
    "CANH_BAO": "⚠️ [AN TOÀN BN]: Thuốc chẹn Beta có nguy cơ gây co thắt phế quản cấp. Cần kiểm tra tiền sử Hen phế quản hoặc bệnh phổi tắc nghẽn mạn tính.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo MA_BEN_CHINH→MA_BENH_CHINH (thiếu chữ H)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_391",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_391",
    "TEN_QUY_TAC": "Cảnh báo sai lệch y lệnh và số lượng",
    "DIEU_KIEN": "XML2.SO_LUONG < (XML2.SL_MOI_NGAY * XML2.SO_NGAY)",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Số lượng cấp phát thấp hơn y lệnh. Vui lòng xác nhận bệnh nhân có tự túc thuốc hay không.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_392",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_392",
    "TEN_QUY_TAC": "Cấu trúc liều dùng chuẩn",
    "DIEU_KIEN": "LEN(TRIM(XML2.LIEU_DUNG)) > 0 AND XML2.LIEU_DUNG NOT REGEXP '\\d+\\s*(viên|gói|ống|ml|chai|lọ)/lần\\s*[+]\\s*\\d+\\s*lần/ngày\\s*[+]\\s*\\d+\\s*ngày\\s*\\[\\d+\\s*(viên|gói|ống|ml|chai|lọ)/ngày\\]' AND XML2.LIEU_DUNG NOT REGEXP '(Sáng|Trưa|Chiều|Tối):\\s*\\d+\\s*(viên|gói|ống|ml).*\\[\\d+\\s*(viên|gói|ống|ml|chai|lọ)/ngày\\]'",
    "CANH_BAO": "⚠️ [NHẬP LIỆU]: Trường LIEU_DUNG chưa tuân thủ cấu trúc TT 37/2024. Ngoại trú: 'X viên/lần + Y lần/ngày + Z ngày [tổng/ngày]'. Nội trú liều thay đổi: 'Sáng: X viên, Chiều: Y viên [tổng/ngày]'.",
    "GHI_CHU": "SỬA 21/03/2026 (lần 2): Viết lại regex theo đúng TT 37/2024. 2 nhánh: (1) Ngoại trú: 'SL/lần + tần suất/ngày + số ngày [tổng/ngày]', (2) Nội trú: 'Buổi: SL...[tổng/ngày]'. Chỉ flag khi LIEU_DUNG có giá trị nhưng không khớp cả 2 format (⚠️ cảnh báo). Phân biệt với dòng 476 (⛔ flag khi trống/thiếu phần tổng).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_393",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_393",
    "TEN_QUY_TAC": "Cefazolin: Tổng liều/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.166' AND (XML2.SO_LUONG * 2) > 6",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Liều Cefazolin vượt 6g/ngày (ngoại trừ viêm nội tâm mạc). Kiểm tra lại chỉ định.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_394",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_394",
    "TEN_QUY_TAC": "Cefixim: Nhất quán Y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.169' AND XML2.SO_LUONG != (XML2.TAN_SUAT * XML2.SL_MOI_LAN)",
    "CANH_BAO": "⚠️ [LỖI NHẬP LIỆU]: Số lượng thuốc kê đơn không khớp với hướng dẫn trong y lệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_395",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_395",
    "TEN_QUY_TAC": "Chế phẩm YHCT thiếu mã giá",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'CP_YHCT' AND IS_EMPTY(XML2.MA_GIA)",
    "CANH_BAO": "⛔ [TT 37/2024]: Chế phẩm thuốc cổ truyền phải có mã giá cụ thể khớp với danh mục đấu thầu để làm căn cứ thanh toán trực tiếp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_396",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_396",
    "TEN_QUY_TAC": "Corticoid dùng dài ngày (>14 ngày)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'CORTICOID' AND XML2.SO_NGAY > 14 AND XML1.MA_BENH_CHINH NOT IN (BENH_TU_MIEN)",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Cảnh báo sử dụng Corticoid kéo dài không có chẩn đoán bệnh tự miễn/mạn tính. Nguy cơ tác dụng phụ suy tuyến thượng thận.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_397",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_397",
    "TEN_QUY_TAC": "Dịch lọc thận (Hemodialysis)",
    "DIEU_KIEN": "XML2.MA_THUOC == 'DICH_LOC_THAN' AND COUNT_IF(XML3, MA_DICH_VU == 'THAN_NHAN_TAO') == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Chi phí dịch lọc thận nhân tạo chỉ được thanh toán khi đi kèm với mã dịch vụ Thận nhân tạo chu kỳ hoặc cấp cứu tương ứng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_398",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_398",
    "TEN_QUY_TAC": "Domperidon viên: độ tuổi + trần 30 mg/ngày",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.688' AND THUOC_398_VI_PHAM_DOMPERIDON(XML1, XML2)",
    "CANH_BAO": "⛔ [CẢNH BÁO DƯỢC]: Domperidon dạng viên (40.688) — Trẻ dưới 12 tuổi: chống chỉ định. Từ 12 tuổi trở lên: liều/ngày = liều dùng × tần suất trong ngày (hoặc SL_MOI_NGAY / TONG_LIEU_24H từ HAM_LUONG) không được vượt 30 mg/ngày (nguy cơ kéo dài QT).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_399",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_399",
    "TEN_QUY_TAC": "Đơn thuốc \"Hẹn khám lại\"",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND IS_EMPTY(XML1.NGAY_TAI_KHAM)",
    "CANH_BAO": "⛔ [TT 26/2025]: Đối với bệnh mạn tính, đơn thuốc phải đi kèm với ngày hẹn tái khám cụ thể trên hệ thống để tính toán thời gian cấp thuốc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_400",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_400",
    "TEN_QUY_TAC": "Đơn thuốc điện tử sai định dạng mã",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 26/2025]: Mã đơn thuốc điện tử quốc gia bắt buộc gồm 12 ký tự, bắt đầu bằng \"DT\" để đồng bộ với hệ thống Đơn thuốc quốc gia.",
    "GHI_CHU": "Giữ OFF: XML130 QĐ 3176 (XML1) không có trường MA_DON_THUOC; cần map từ hệ thống đơn thuốc điện tử/DU_PHONG trước khi bật.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_401",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_401",
    "TEN_QUY_TAC": "Đơn thuốc mạn tính - Đổi thuốc",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT != XML_DON_CU.MA_HOAT_CHAT AND XML2.SO_NGAY > 30",
    "CANH_BAO": "⚠️ [TT 26/2025]: Khi thay đổi hoạt chất trong đơn thuốc mạn tính, nên kê đơn ngắn ngày (7-14 ngày) để theo dõi phản ứng trước khi cấp đơn 30 ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_402",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_402",
    "TEN_QUY_TAC": "Đơn thuốc mạn tính < 30 ngày",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH IN (PL1_TT26) AND XML2.SO_NGAY < 30 AND XML1.MA_LY_DO_VVIEN == '1'",
    "CANH_BAO": "⚠️ [TT 26/2025]: Đối với các bệnh mạn tính tại Phụ lục 1, bác sĩ nên kê đơn tối thiểu 30 ngày để đảm bảo quyền lợi và giảm số lần tái khám của bệnh nhân.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo MA_BEN_CHINH→MA_BENH_CHINH (thiếu chữ H)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_403",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_403",
    "TEN_QUY_TAC": "Đơn thuốc mạn tính khác tỉnh",
    "DIEU_KIEN": "XML1.MA_TINH != CSKCB.MA_TINH AND XML2.SO_NGAY > 30",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Kê đơn thuốc mạn tính dài ngày cho bệnh nhân ngoại tỉnh cần lưu ý kiểm tra lịch sử cấp trùng thuốc tại địa phương của bệnh nhân.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_404",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_404",
    "TEN_QUY_TAC": "Đơn thuốc mạn tính quá 30 ngày",
    "DIEU_KIEN": "XML2.SO_NGAY > 30 AND XML1.MA_BENH_CHINH NOT IN ('I10','E11','N18','B20') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐÁI THÁO ĐƯỜNG|SUY THẬN MẠN|HIV)'",
    "CANH_BAO": "⛔ [TT 26/2025]: Cảnh báo kê đơn thuốc dài ngày (>30 ngày) cho mã bệnh không thuộc danh mục bệnh dài ngày tại Phụ lục 1 TT 26.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx",
    "GHI_CHU_SUA": "✏️ Trùng nội dung với CLN-THUOC-04 (giamDinhThuoc): ngoại trú >30 ngày khi ICD không thuộc danh mục cho phép — CLN dùng BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY đầy đủ; THUOC_404 chỉ heuristic vài mã → OFF. Xem thêm THUOC_405 (PL_1_TT_26_2025) nếu cần kiểm tra phụ lục TT 26."
  },
  {
    "id": "SEED_THUOC_405",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_405",
    "TEN_QUY_TAC": "Đơn thuốc mạn tính sai danh mục",
    "DIEU_KIEN": "XML2.SO_NGAY > 30 AND XML1.MA_BENH_CHINH NOT IN (PL_1_TT_26_2025)",
    "CANH_BAO": "⛔ [TT 26/2025]: Chỉ các bệnh thuộc danh mục Phụ lục 1 (TT 26/2025) mới được kê đơn tối đa 30 ngày (Dự phòng thuốc dài ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_406",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_406",
    "TEN_QUY_TAC": "Đơn thuốc ngoại trú quá 05 ngày",
    "DIEU_KIEN": "DIFF_DAYS(XML2.NGAY_YL, TODAY) > 5 AND XML1.MA_LOAI_KCB == '1' AND XML2.TRANG_THAI == 'CHUA_MUA'",
    "CANH_BAO": "⛔ [TT 26/2025]: Đơn thuốc ngoại trú chỉ có giá trị mua/lĩnh thuốc trong vòng 05 ngày kể từ ngày kê đơn. Quá hạn hệ thống phải khóa đơn.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_407",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_407",
    "TEN_QUY_TAC": "Đơn thuốc tâm thần quá 10 ngày",
    "DIEU_KIEN": "XML2.MA_NHOM == 'TAM_THAN' AND XML2.SO_NGAY > 10 AND XML1.MA_BENH_CHINH NOT IN (PL1_TT26)",
    "CANH_BAO": "⛔ [TT 26/2025]: Thuốc an thần, gây ngủ kê đơn ngoại trú không được vượt quá 10 ngày (trừ bệnh mạn tính chuyên khoa tâm thần).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_408",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_408",
    "TEN_QUY_TAC": "Đơn thuốc YHCT thiếu liều lượng",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'THUOC_THANG' AND IS_EMPTY(XML2.LIEU_DUNG)",
    "CANH_BAO": "⛔ [TT 26/2025]: Đơn thuốc YHCT bắt buộc phải ghi chi tiết liều dùng cho từng vị thuốc thành phần hoặc tổng thang thuốc theo quy định.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_409",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_409",
    "TEN_QUY_TAC": "Erythropoietin (EPO)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.237' AND XML1.MA_BENH_CHINH NOT IN ('N18','D61','C00-C97')",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc kích thích tạo hồng cầu chỉ thanh toán cho bệnh nhân suy thận mạn, suy tủy xương hoặc thiếu máu do hóa trị ung thư.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_410",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_410",
    "TEN_QUY_TAC": "Ghi tên thuốc theo yêu cầu BN",
    "DIEU_KIEN": "XML2.GHI_CHU LIKE '%Theo yêu cầu của BN%' AND XML2.T_BHTT > 0",
    "CANH_BAO": "⛔ [VI PHẠM]: Thuốc kê theo yêu cầu riêng của bệnh nhân (không theo chỉ định chuyên môn) không được quỹ BHYT chi trả.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_411",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_411",
    "TEN_QUY_TAC": "Kiểm tra cấp thuốc lẻ (Ống/Lọ)",
    "DIEU_KIEN": "XML2.TEN_THUOC REGEXP 'Ống|Lọ' AND XML2.SL_MOI_LAN < 1 AND XML2.SO_LUONG != CEIL(XML2.TAN_SUAT * XML2.SL_MOI_LAN * XML2.SO_NGAY)",
    "CANH_BAO": "⚠️ [HÀNH CHÍNH]: Y lệnh dùng thuốc lẻ ({SL_MOI_LAN} ống) nhưng số lượng tổng không được làm tròn đúng quy định quản lý kho.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_412",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_412",
    "TEN_QUY_TAC": "Kiểm tra Mã thuốc tự chế",
    "DIEU_KIEN": "MA_PP_CHEBIEN IS NOT NULL AND MA_THUOC NOT REGEXP '^[0-9]{4}[.][A-Z0-9]+'",
    "CANH_BAO": "⚠️ [DANH MỤC]: Thuốc tự bào chế/pha chế phải có mã cấu trúc YYYY.SDK theo quy định mới.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_413",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_413",
    "TEN_QUY_TAC": "Kiểm tra Phạm vi & Tỷ lệ",
    "DIEU_KIEN": "PHAM_VI == 2 AND (TYLE_TT_BH > 0 OR THANH_TIEN_BH > 0)",
    "CANH_BAO": "⛔ [SAI CHÍNH SÁCH]: Thuốc ngoài phạm vi BHYT (Mã 2) nhưng vẫn đề nghị quỹ thanh toán.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_414",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_414",
    "TEN_QUY_TAC": "Kiểm tra Thành tiền BH",
    "DIEU_KIEN": "ABS(THANH_TIEN_BH - (SO_LUONG * DON_GIA * TYLE_TT_BH / 100)) > 0.01",
    "CANH_BAO": "⛔ [SAI TÍNH TOÁN]: Thành tiền BHYT thanh toán sai lệch so với Tỷ lệ TT hưởng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_415",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_415",
    "TEN_QUY_TAC": "Kiểm tra Thành tiền BV",
    "DIEU_KIEN": "ABS(THANH_TIEN_BH - (SO_LUONG * DON_GIA * (TYLE_TT_BH / 100) * (XML2.MUC_HUONG / 100))) > 0.01",
    "CANH_BAO": "⛔ [SAI TÍNH TOÁN]: Thành tiền BV không khớp với tích Số lượng * Đơn giá.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_416",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_416",
    "TEN_QUY_TAC": "Kiểm tra Thuốc cấp dư",
    "DIEU_KIEN": "SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Số lượng thuốc vượt quá định mức y lệnh thực tế ({CALC_SL_MOI_NGAY} đơn vị/ngày x {SO_NGAY} ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_417",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_417",
    "TEN_QUY_TAC": "Kiểm tra thuốc cấp dư (Dựa trên y lệnh)",
    "DIEU_KIEN": "XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc {TEN_THUOC} cấp dư {DU_QTY} đơn vị. (Kê đơn: {SO_LUONG}, Y lệnh thực tế: {SL_MOI_NGAY} {UNIT}/ngày x {SO_NGAY} ngày).",
    "GHI_CHU": "Ngoại trừ nội trú xuất viện: toa mang về khi NGAY_YL/NGAY_TH_YL trùng ngày NGAY_RA — bỏ qua THUOC_417 (locDuongTinhGia: laDongThuocToaXuatVienNoiTru).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_418",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_418",
    "TEN_QUY_TAC": "Giới hạn đơn thuốc 30 ngày",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND XML2.SO_NGAY > 30 AND XML1.MA_BENH_CHINH NOT IN ('I10','E11','E10','B20') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐÁI THÁO ĐƯỜNG|ĐÁI THÁO ĐƯỜNG TÝP 1|HIV)'",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Đơn thuốc ngoại trú vượt quá 30 ngày (trừ bệnh mạn tính quy định tại Phụ lục TT 26/2025).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_419",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_419",
    "TEN_QUY_TAC": "Hạng bệnh viện thấp hơn quy định",
    "DIEU_KIEN": "DM_THUOC.HANG_BV_MIN < CSKCB.HANG_BV",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc chỉ được sử dụng tại bệnh viện hạng Đặc biệt, hạng I. Bệnh viện hạng hiện tại không đủ điều kiện thanh toán.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_420",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_420",
    "TEN_QUY_TAC": "Insulin dùng sai chẩn đoán",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == 'INSULIN' AND XML1.MA_BENH_CHINH NOT LIKE 'E%'",
    "CANH_BAO": "⛔ [VBHN 15]: Insulin chỉ thanh toán cho chẩn đoán Đái tháo đường (Nhóm E10-E14) hoặc cấp cứu tăng Kali máu/Toan Ceton.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_421",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_421",
    "TEN_QUY_TAC": "IV Ig (Immune Globulin)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.1044' AND XML1.MA_BENH_CHINH NOT IN ('G61.0','M30.3','D69.3') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(HỘI CHỨNG GUILLAIN-BARRÉ|GIẢM TIỂU CẦU)'",
    "CANH_BAO": "⛔ [VBHN 15]: Immune Globulin chỉ thanh toán cho Hội chứng Guillain-Barre, Kawasaki hoặc Xuất huyết giảm tiểu cầu (ITP) theo đúng chỉ định.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_422",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_422",
    "TEN_QUY_TAC": "Ketorolac: Liều tối đa/24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.39' AND (XML2.SO_LUONG * 30) > 90",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Liều Ketorolac vượt ngưỡng an toàn (90mg/ngày). Nguy cơ thủng dạ dày và suy thận cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_423",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_423",
    "TEN_QUY_TAC": "Kê đơn không có định danh cơ sở",
    "DIEU_KIEN": "IS_EMPTY(XML1.MA_CSKCB) OR (IS_EMPTY(XML2.MA_BAC_SI) OR TRIM(XML2.MA_BAC_SI) == '')",
    "CANH_BAO": "⛔ [TT 26/2025]: Đơn thuốc điện tử hợp lệ phải có mã cơ sở KCB và mã định danh bác sĩ đã đăng ký trên hệ thống đơn thuốc quốc gia.",
    "GHI_CHU": "KIỂM TRA 21/03/2026: Luật hợp lệ ✅. Kiểm tra MA_CSKCB và MA_BAC_SI theo TT 26/2025 điều kiện đơn thuốc điện tử hợp lệ. Lưu ý: Thêm TRIM guard cho MA_BAC_SI format 'XXXXX/XX-CCHN'.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_424",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_424",
    "TEN_QUY_TAC": "Kê đơn không có Mã bác sĩ",
    "DIEU_KIEN": "IS_EMPTY(XML2.MA_BAC_SI)",
    "CANH_BAO": "⛔ [LỖI NGHIÊM TRỌNG]: Thông tin người kê đơn (Mã chứng chỉ hành nghề) bị bỏ trống. Sai quy định TT 26/2025.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_426",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_426",
    "TEN_QUY_TAC": "Kê đơn thay thế (Biosimilar)",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'SINH_PHAM' AND XML2.GHI_CHU_BN NOT LIKE '%Xác nhận BN%' AND XML2.DU_PHONG NOT LIKE '%Xác nhận BN%'",
    "CANH_BAO": "⛔ [TT 26/2025]: Thay thế thuốc sinh phẩm (Biosimilar) tại nhà thuốc bệnh viện phải có sự tư vấn và xác nhận đồng ý của người bệnh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_427",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_427",
    "TEN_QUY_TAC": "Kê đơn thuốc \"Dưỡng tóc/Trị mụn\"",
    "DIEU_KIEN": "XML2.TEN_THUOC LIKE '%Trị rụng tóc%' OR XML2.TEN_THUOC LIKE '%Trị mụn trứng cá%'",
    "CANH_BAO": "⛔ [LOẠI TRỪ]: BHYT không thanh toán cho thuốc điều trị rụng tóc, mụn trứng cá vì mục đích thẩm mỹ theo quy định tại Luật BHYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_428",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_428",
    "TEN_QUY_TAC": "Kê đơn thuốc cho trẻ < 6 tháng",
    "DIEU_KIEN": "XML1.TUOI_NGAY < 180 AND XML2.MA_DUONG_DUNG == '1.01' AND XML2.DANG_BAO_CHE == 'VIEN'",
    "CANH_BAO": "⚠️ [TT 26/2025]: Hạn chế kê đơn thuốc dạng viên cho trẻ dưới 06 tháng tuổi. Khuyến khích sử dụng dạng lỏng (siro, nhỏ giọt) để đảm bảo an toàn.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_429",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_429",
    "TEN_QUY_TAC": "Kê đơn thuốc gây nghiện (Sản khoa)",
    "DIEU_KIEN": "XML1.MA_KHOA == 'KHOA_SAN' AND XML2.MA_NHOM == 'GAY_NGHIEN' AND XML1.MA_BENH_CHINH NOT IN ('O82','C53') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(MỔ LẤY THAI|SINH MỔ)'",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Thuốc gây nghiện (Morphin) trong khoa Sản thường chỉ dùng sau mổ (O82) hoặc giảm đau ung thư tử cung (C53). Rà soát tính hợp lý.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_430",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_430",
    "TEN_QUY_TAC": "Kê thực phẩm chức năng trong đơn",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'TPCN' OR XML2.TEN_THUOC LIKE '%Thực phẩm bảo vệ sức khỏe%'",
    "CANH_BAO": "⛔ [CẤM - TT 26/2025]: Không được kê thực phẩm chức năng, mỹ phẩm trong đơn thuốc hóa dược, sinh phẩm. BHYT từ chối 100%.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_431",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_431",
    "TEN_QUY_TAC": "Kháng sinh cùng nhóm (Trùng lặp)",
    "DIEU_KIEN": "COUNT_IF(XML2, NHOM_KS == 'Cephalosporin_3') > 1",
    "CANH_BAO": "⛔ [AN TOÀN]: Phát hiện kê đơn đồng thời 02 loại kháng sinh cùng một nhóm (VD: 2 loại Cepha thế hệ 3). Nguy cơ tương tác và không tối ưu chi phí.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_432",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_432",
    "TEN_QUY_TAC": "Kháng sinh dự phòng > 24h",
    "DIEU_KIEN": "XML2.MA_NHOM == 'KS_DU_PHONG' AND XML2.SO_NGAY > 1 AND XML1.MA_LOAI_KCB == '3'",
    "CANH_BAO": "⛔ [VBHN 15]: Kháng sinh dự phòng phẫu thuật thường chỉ thanh toán trong vòng 24h. Kê đơn kéo dài không có bằng chứng nhiễm khuẩn sẽ bị xuất toán.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_433",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_433",
    "TEN_QUY_TAC": "Kháng sinh Linezolid (G3)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.228' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_CONG_THUC_MAU') == 0",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Linezolid có nguy cơ gây giảm tiểu cầu. Cần xét nghiệm công thức máu định kỳ hàng tuần khi điều trị kéo dài.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_434",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_434",
    "TEN_QUY_TAC": "Kháng sinh quý hiếm (Nhóm G3)",
    "DIEU_KIEN": "DM_THUOC.NHOM_DIEU_KIEN == 'G3' AND COUNT_IF(XML3, MA_DICH_VU == 'KS_DO') == 0",
    "CANH_BAO": "⚠️ [HƯỚNG DẪN BYT]: Kháng sinh hạn chế chỉ nên chỉ định sau khi có kết quả Kháng sinh đồ hoặc ý kiến hội chẩn Ban quản lý kháng sinh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_435",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_435",
    "TEN_QUY_TAC": "Kháng sinh Vancomycin (TDM)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.189' AND XML2.SO_NGAY > 3 AND COUNT_IF(XML3, MA_DICH_VU == 'XN_DINH_LUONG_VANCO') == 0",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Khuyến khích định lượng nồng độ thuốc trong máu (TDM) đối với Vancomycin khi dùng kéo dài để tránh độc tính trên thận.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_437",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_437",
    "TEN_QUY_TAC": "Kiểm tra Thời điểm y lệnh",
    "DIEU_KIEN": "NGAY_YL < XML1.NGAY_VAO OR NGAY_YL > XML1.NGAY_RA",
    "CANH_BAO": "⛔ [SAI THỜI GIAN]: Ngày ra y lệnh thuốc nằm ngoài khoảng thời gian điều trị của hồ sơ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_438",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_438",
    "TEN_QUY_TAC": "Kiểm tra trường bắt buộc",
    "DIEU_KIEN": "MA_LK IS NULL OR MA_THUOC IS NULL OR TEN_THUOC IS NULL OR SO_LUONG <= 0 OR DON_GIA < 0",
    "CANH_BAO": "⛔ [LỖI DỮ LIỆU]: Thiếu thông tin bắt buộc hoặc giá trị (Số lượng/Đơn giá) không hợp lệ theo QĐ 130.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_439",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_439",
    "TEN_QUY_TAC": "Làm tròn số lượng thuốc lẻ",
    "DIEU_KIEN": "XML2.SO_LUONG != ROUND(XML2.SO_LUONG, 2)",
    "CANH_BAO": "⛔ [TT 37/2024]: Số lượng thuốc thanh toán phải ghi chính xác đến 02 chữ số thập phân, không được làm tròn sai lệch so với y lệnh thực tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_440",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_440",
    "TEN_QUY_TAC": "Levocetirizin: Liều tối đa",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.90' AND (CALC_TAN_SUAT > 1 OR CALC_SL_MOI_NGAY > 1)",
    "CANH_BAO": "⛔ [SAI LIỀU]: Levocetirizin chỉ dùng tối đa 1 viên (10mg)/ngày. Y lệnh kiểu \"Tối: 1 viên (uống)\" được tính là hợp lệ (1 viên/ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_441",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_441",
    "TEN_QUY_TAC": "Mã hóa khí y tế chuẩn",
    "DIEU_KIEN": "(TEN_THUOC LIKE 'Khí Oxy%' OR TEN_THUOC LIKE 'Oxy y tế%') AND MA_THUOC != '40.17'",
    "CANH_BAO": "⛔ [SAI MÃ DANH MỤC]: Khí Oxy/NO phải sử dụng mã hoạt chất chuẩn (40.17 / 40.573) theo QĐ 130.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_442",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_442",
    "TEN_QUY_TAC": "Methylprednisolon: Liều/24h",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Liều Corticoid cao (> 128mg/ngày). Yêu cầu xác nhận phác đồ điều trị đặc biệt.",
    "GHI_CHU": "✏️ [Production review] Vô hiệu hóa trước deploy: rule phụ thuộc REGEX_SUM/CAST và truy cập trực tiếp tập XML2 như một dòng đơn; engine hiện tại không hỗ trợ an toàn và XML chuẩn không đảm bảo suy được tổng mg/ngày chính xác chỉ từ text LIEU_DUNG.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_443",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_443",
    "TEN_QUY_TAC": "Người mua hộ thuốc thiếu định danh",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 26/2025]: Trường hợp người mua hộ nhận thuốc thay, bắt buộc phải cập nhật số CCCD/Định danh cá nhân của người mua hộ vào hệ thống.",
    "GHI_CHU": "Giữ OFF: Bảng 2 XML130 QĐ 3176 không có HOTEN_NGUOI_MUA_HO/CCCD_NGUOI_MUA_HO.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_444",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_444",
    "TEN_QUY_TAC": "Nhất quán y lệnh lẻ",
    "DIEU_KIEN": "DON_VI_TINH REGEXP 'Ống|Lọ' AND CALC_SL_MOI_LAN < 1 AND SO_LUONG != CEIL(CALC_SL_MOI_NGAY * SO_NGAY)",
    "CANH_BAO": "⚠️ [HÀNH CHÍNH]: Y lệnh dùng thuốc lẻ ({CALC_SL_MOI_LAN} ống) nhưng tổng cấp phát chưa được làm tròn đúng quy định kho.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_445",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_445",
    "TEN_QUY_TAC": "Phối hợp 2 loại kháng nấm",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_NHOM == 'KHANG_NAM') > 1",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Chỉ định đồng thời 02 thuốc kháng nấm hệ thống. Cần hội chẩn chuyên khoa truyền nhiễm hoặc vi sinh.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_446",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_446",
    "TEN_QUY_TAC": "Phối hợp 2 loại PPI",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_NHOM == 'PPI') > 1",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Chỉ định đồng thời 02 loại thuốc ức chế bơm Proton (VD: Esomeprazol + Pantoprazol). Vi phạm nguyên tắc sử dụng thuốc hợp lý.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_447",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_447",
    "TEN_QUY_TAC": "PPI dự phòng loét sai chỉ định",
    "DIEU_KIEN": "XML2.MA_NHOM == '6.2' AND XML1.MA_BENH_CHINH NOT IN ('K21','K25','K26','K27','K29') AND COUNT_IF(XML2, MA_NHOM == 'CORTICOID' OR MA_NHOM == 'NSAID') == 0 AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TRÀO NGƯỢC DẠ DÀY|GERD|LOÉT DẠ DÀY|LOÉT TÁ TRÀNG|LOÉT DẠ DÀY TÁ TRÀNG|VIÊM DẠ DÀY)'",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc ức chế bơm Proton (PPI) dùng dự phòng loét chỉ được thanh toán khi bệnh nhân có sử dụng kèm Corticoid hoặc NSAID liều cao.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_448",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_448",
    "TEN_QUY_TAC": "Rosuvastatin: Kiểm soát liều 24h",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND TONG_LIEU_24H > 40",
    "CANH_BAO": "⛔ [NGUY HIỂM]: Tổng liều Rosuvastatin vượt 40mg/ngày. Nguy cơ cao gây tiêu cơ vân.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx",
    "GHI_CHU_SUA": "✏️ Điều kiện cũ (SO_LUONG*10) sai — SO_LUONG là tổng đợt (vd 14 viên/7 ngày), không phải viên/ngày. Liều 24h đúng = TONG_LIEU_24H (HAM_LUONG mg × SL_MOI_NGAY). Trùng nội dung THUOC_327 → OFF; bật lại chỉ khi cần tách mã."
  },
  {
    "id": "SEED_THUOC_449",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_449",
    "TEN_QUY_TAC": "Rosuvastatin: Nhất quán Y lệnh",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.558' AND TO_NUMBER(XML2.SL_MOI_NGAY) > 0 AND TO_NUMBER(XML2.SO_NGAY) > 0 AND TO_NUMBER(XML2.SO_LUONG) != (TO_NUMBER(XML2.SL_MOI_NGAY) * TO_NUMBER(XML2.SO_NGAY))",
    "CANH_BAO": "⛔ [SAI DỮ LIỆU]: Số lượng xuất (SO_LUONG) không khớp tổng liều suy từ LIEU_DUNG: SL_MOI_NGAY/ngày × SO_NGAY (engine bổ sung từ parse LIEU_DUNG; không so chỉ với liều 1 ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx",
    "GHI_CHU_SUA": "✏️ SO_LUONG là tổng cả đợt (vd 1 viên/ngày × 28 ngày = 28); đổi từ TAN_SUAT*SL_MOI_LAN (≈ liều/ngày) sang SL_MOI_NGAY*SO_NGAY."
  },
  {
    "id": "SEED_THUOC_450",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_450",
    "TEN_QUY_TAC": "Sai lệch Đơn giá trúng thầu",
    "DIEU_KIEN": "XML2.DON_GIA > DM_THUOC.GIA_TRUNG_THAU",
    "CANH_BAO": "⛔ [VI PHẠM GIÁ]: Đơn giá thanh toán cao hơn giá thuốc trúng thầu còn hiệu lực (Theo Thông tư 37/2024).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_451",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_451",
    "TEN_QUY_TAC": "Sai lệch tiền trần thanh toán (theo đơn vị)",
    "DIEU_KIEN": "TO_NUMBER(XML2.DON_GIA) > 0 AND THUOC_451_VI_PHAM_TRAN_BH_TREN_DON_VI(XML1, XML2)",
    "CANH_BAO": "⛔ [TT 37/2024]: Tiền BHYT trên một đơn vị cấp phát (THANH_TIEN_BH ÷ SO_LUONG khi SL > 0; nếu không có SL thì lấy THANH_TIEN_BH như tiền/đơn vị) vượt DON_GIA (đơn giá/đơn vị). Không so tổng THANH_TIEN_BH với đơn giá.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx",
    "GHI_CHU_SUA": "✏️ So trần theo đơn vị: THANH_TIEN_BH là thành tiền BHYT cả dòng — quy đổi tiền BHYT/1 đơn vị rồi mới so với DON_GIA; không dùng T_TRANTT (có thể bị enrich ghi đè)."
  },
  {
    "id": "SEED_THUOC_452",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_452",
    "TEN_QUY_TAC": "Sai mã đường dùng (XML 2)",
    "DIEU_KIEN": "XML2.DUONG_DUNG NOT IN (PL_05_10_QD130)",
    "CANH_BAO": "⛔ [QĐ 130/3176]: Mã đường dùng phải tuân thủ đúng danh mục 32 mã quy định tại Phụ lục 05.10 QĐ 130/BYT (VD: 1.01 là đường uống).",
    "GHI_CHU": "SỬA 21/03/2026: Đổi tên trường MA_DUONG_DUNG → DUONG_DUNG theo schema XML2 QĐ 130. Báo cáo ghi 'TT 05/2024' là SAI - luật kiểm tra theo QĐ 130/3176 Phụ lục 05.10, không phải TT 05. Đã loại bỏ trùng lắp: chỉ giữ luật QĐ 130/3176 (11 ca).",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_453",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_453",
    "TEN_QUY_TAC": "Sắc thuốc YHCT thiếu dịch vụ",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'THUOC_THANG' AND COUNT_IF(XML3, MA_DICH_VU == 'DV_SAC_THUOC_MAY') == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc thang được kê đơn mà không phát sinh dịch vụ sắc thuốc tại viện là không hợp lệ (trừ trường hợp BN tự sắc có ghi chú).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_454",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_454",
    "TEN_QUY_TAC": "Statin dùng cho BN không hạ mỡ",
    "DIEU_KIEN": "XML2.MA_NHOM == 'Statin' AND XML1.MA_BENH_CHINH NOT LIKE 'E78%'",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc hạ Lipid máu chỉ được thanh toán cho các mã bệnh Rối loạn Lipoprotein hoặc bệnh lý mạch vành có chỉ định bắt buộc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_455",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_455",
    "TEN_QUY_TAC": "Thay thế thuốc không ký xác nhận",
    "DIEU_KIEN": "(XML2.GHI_CHU LIKE '%Thay thế%' OR XML2.DU_PHONG LIKE '%Thay thế%') AND IS_EMPTY(XML2.MA_BS_THAY_THE)",
    "CANH_BAO": "⛔ [TT 26/2025]: Trường hợp thay thế thuốc trong đơn tại nhà thuốc BV, người thay thế phải có trình độ dược sĩ đại học và ký tên xác nhận trên hệ thống.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_456",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_456",
    "TEN_QUY_TAC": "Thay thế thuốc sinh phẩm",
    "DIEU_KIEN": "XML2.TEN_THUOC != XML2.TEN_THUOC_GOC AND DM_THUOC.LOAI == 'SINH_PHAM'",
    "CANH_BAO": "⛔ [TT 26/2025]: Không được tự ý thay thế thuốc sinh phẩm trong đơn. Việc thay thế phải có sự đồng ý của bác sĩ điều trị và ghi rõ vào hồ sơ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_457",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_457",
    "TEN_QUY_TAC": "Thiếu cấu trúc liều dùng XML2",
    "DIEU_KIEN": "IS_EMPTY(XML2.LIEU_DUNG) OR (XML2.LIEU_DUNG NOT REGEXP '\\d+\\s*(viên|gói|ống|ml|chai|lọ)/lần\\s*[+]\\s*\\d+\\s*lần/ngày' AND XML2.LIEU_DUNG NOT REGEXP '(Sáng|Trưa|Chiều|Tối):\\s*\\d+\\s*(viên|gói|ống|ml)') OR XML2.LIEU_DUNG NOT REGEXP '\\[\\d+\\s*(viên|gói|ống|ml|chai|lọ)/ngày\\]'",
    "CANH_BAO": "⛔ [TT 37/2024]: Trường Liều dùng (Cột 19 Bảng 2) bắt buộc ghi: số lượng/lần + số lần/ngày + số ngày [tổng/ngày] (ngoại trú) hoặc Sáng/Chiều/Tối: số lượng [tổng/ngày] (nội trú liều thay đổi).",
    "GHI_CHU": "SỬA 21/03/2026 (lần 2): Điều kiện mới 3 lớp: (1) LIEU_DUNG trống, (2) không khớp format ngoại trú lẫn nội trú, (3) thiếu phần tổng bắt buộc [SL/ngày]. Đã test logic với 5 test case TT 37/2024 - tất cả đúng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_459",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_459",
    "TEN_QUY_TAC": "Thuốc bổ não cho BN chấn thương",
    "DIEU_KIEN": "XML2.MA_NHOM == 'BO_NAO' AND XML1.MA_BENH_CHINH STARTS_WITH 'S06'",
    "CANH_BAO": "⚠️ [HƯỚNG DẪN BYT]: Các thuốc hỗ trợ thần kinh (Cerebrolysin, Citicoline) không có bằng chứng cải thiện rõ rệt trong chấn thương sọ não cấp.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_460",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_460",
    "TEN_QUY_TAC": "Thuốc bổ sung Magie/B6",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.932' AND XML1.MA_BENH_CHINH NOT IN ('E53.1','E61.2','G43','O14')",
    "CANH_BAO": "⛔ [VBHN 15]: Magne B6 chỉ thanh toán cho thiếu hụt vitamin/khoáng chất, đau đầu Migraine hoặc dự phòng tiền sản giật/dọa sinh non.",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo MA_BEN_CHINH→MA_BENH_CHINH (thiếu chữ H)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_461",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_461",
    "TEN_QUY_TAC": "Thuốc bổ sung sắt (Tiêm)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'SAT_TIEM' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_FERRITIN') == 0",
    "CANH_BAO": "⛔ [VBHN 15]: Sắt dạng tiêm chỉ thanh toán khi có xét nghiệm Ferritin thấp hoặc bệnh nhân chạy thận nhân tạo chu kỳ.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_462",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_462",
    "TEN_QUY_TAC": "Thuốc bôi ngoài da (Corticoid)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'CORTICOID_BOI' AND XML2.SO_LUONG > 5 AND XML1.MA_LOAI_KCB == '1'",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Số lượng tuýp thuốc bôi ngoài da vượt định mức hợp lý cho một đợt điều trị ngoại trú 07 ngày.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_463",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_463",
    "TEN_QUY_TAC": "Thuốc bôi rụng tóc (Minoxidil)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.545' AND XML1.MA_BENH_CHINH STARTS_WITH 'L65'",
    "CANH_BAO": "⛔ [LOẠI TRỪ]: Thuốc điều trị rụng tóc (L65) không thuộc phạm vi thanh toán của BHYT theo quy định tại Điều 23 Luật BHYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_464",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_464",
    "TEN_QUY_TAC": "Thuốc cản quang - Tiền sử dị ứng",
    "DIEU_KIEN": "XML2.MA_NHOM == 'CAN_QUANG' AND IS_EMPTY(XML1.GHI_CHU)",
    "CANH_BAO": "⚠️ [JCI SQE]: Sử dụng thuốc cản quang bắt buộc phải khai thác và ghi nhận tiền sử dị ứng thuốc/hải sản của người bệnh vào hồ sơ điện tử.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_465",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_465",
    "TEN_QUY_TAC": "Thuốc cản quang không có DVKT",
    "DIEU_KIEN": "XML2.MA_NHOM == 'CAN_QUANG' AND COUNT_IF(XML3, MA_NHOM IN ('3','7')) == 0",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc cản quang/chất đánh dấu chỉ được thanh toán khi có phát sinh dịch vụ Chẩn đoán hình ảnh (Bảng 3) tương ứng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_466",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_466",
    "TEN_QUY_TAC": "Thuốc cấp tại Trạm y tế xã",
    "DIEU_KIEN": "CSKCB.TUYEN == '4' AND XML2.MA_THUOC NOT IN (DM_THUOC_TUYEN_XA)",
    "CANH_BAO": "⛔ [VBHN 15]: Trạm y tế xã chỉ được thanh toán các thuốc thuộc danh mục quy định cho tuyến xã. Thuốc vượt tuyến sẽ bị xuất toán 100%.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_467",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_467",
    "TEN_QUY_TAC": "Thuốc chống đông (NOAC)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'NOAC' AND XML1.MA_BENH_CHINH NOT IN ('I48','I26','I80') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(RUNG NHĨ|CUỒNG NHĨ|THUYÊN TẮC PHỔI|HUYẾT KHỐI TĨNH MẠCH)'",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc chống đông đường uống thế hệ mới (Rivaroxaban, Dabigatran...) chỉ thanh toán cho rung nhĩ phi van tim hoặc thuyên tắc tĩnh mạch sâu.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_468",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_468",
    "TEN_QUY_TAC": "Thuốc chống loạn thần (Clozapine)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.402' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_CONG_THUC_MAU') == 0",
    "CANH_BAO": "⛔ [VBHN 15]: Clozapine có nguy cơ gây mất bạch cầu hạt. Bắt buộc kiểm tra công thức máu hàng tuần trong 18 tuần đầu điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_469",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_469",
    "TEN_QUY_TAC": "Thuốc chống thải ghép (Sau ghép tạng)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'CHONG_THAI_GHEP' AND XML1.MA_BENH_CHINH NOT IN ('Z94.0','Z94.1','Z94.4')",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc chống thải ghép (Cyclosporin, Tacrolimus...) chỉ thanh toán cho BN sau ghép tạng (Thận, Tim, Gan) hoặc bệnh tự miễn đặc biệt.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_470",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_470",
    "TEN_QUY_TAC": "Thuốc Corticoid tiêm ổ khớp",
    "DIEU_KIEN": "XML2.MA_DUONG_DUNG == '2.06' AND COUNT_IF(XML3, MA_DICH_VU == 'SIEU_AM_KHOP') == 0",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Tiêm khớp cần có siêu âm dẫn đường hoặc thăm khám lâm sàng khớp kỹ lưỡng để tránh biến chứng nhiễm trùng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_471",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_471",
    "TEN_QUY_TAC": "Thuốc dịch truyền (Đóng gói lẻ)",
    "DIEU_KIEN": "XML2.MA_DUONG_DUNG == '2.14' AND XML2.DON_VI_TINH == 'VIEN'",
    "CANH_BAO": "⛔ [DỮ LIỆU]: Sai đơn vị tính. Thuốc truyền tĩnh mạch không thể có đơn vị tính là \"Viên\". Kiểm tra lại danh mục thuốc XML2.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_472",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_472",
    "TEN_QUY_TAC": "Thuốc dịch truyền dinh dưỡng (G1)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'DINH_DUONG' AND XML1.MA_BENH_CHINH NOT IN ('E40','E41','E42','E43','E44','E45','E46')",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc dinh dưỡng đường tĩnh mạch chỉ thanh toán cho bệnh nhân suy dinh dưỡng nặng hoặc không nuôi ăn được qua đường tiêu hóa.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_473",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_473",
    "TEN_QUY_TAC": "Thuốc dùng cho BN nội trú ban ngày",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '3' AND (UPPER(XML1.DU_PHONG) LIKE '%BAN NGÀY%' OR UPPER(XML1.GHI_CHU) LIKE '%BAN NGÀY%' OR UPPER(XML1.DU_PHONG) LIKE '%ĐIỀU TRỊ BAN NGÀY%' OR UPPER(XML1.GHI_CHU) LIKE '%ĐIỀU TRỊ BAN NGÀY%') AND COUNT_IF(XML2, MA_DUONG_DUNG == '1.01') > 0",
    "CANH_BAO": "⚠️ [TT 37/2024]: Bệnh nhân nằm viện ban ngày hạn chế thanh toán thuốc uống tại giường (trừ thuốc đặc trị). Ưu tiên kê đơn thuốc về nhà theo đơn ngoại trú.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_474",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_474",
    "TEN_QUY_TAC": "Thuốc dùng khi BV thiếu (Cấp cứu)",
    "DIEU_KIEN": "(XML1.DU_PHONG LIKE '%tự mua%' OR XML1.GHI_CHU LIKE '%tự mua%' OR XML1.DU_PHONG LIKE '%tu muc%' OR XML1.GHI_CHU LIKE '%tu muc%') AND XML1.MA_LY_DO_VVIEN != '2'",
    "CANH_BAO": "⚠️ [TT 37/2024]: Thuốc do bệnh nhân tự mua chỉ được BHYT thanh toán trực tiếp khi cơ sở KCB không cung ứng được thuốc thuộc danh mục cấp cứu.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_475",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_475",
    "TEN_QUY_TAC": "Thuốc dùng trong ngày ra viện",
    "DIEU_KIEN": "XML2.NGAY_YL == XML1.NGAY_RA AND XML1.MA_LOAI_KCB == '3'",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Thuốc nội trú chỉ định đúng ngày ra viện cần kiểm tra lại là thuốc dùng tại giường hay thuốc cấp cho bệnh nhân về nhà (phải chuyển sang đơn ngoại trú).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_476",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_476",
    "TEN_QUY_TAC": "Thuốc dự phòng phơi nhiễm (ARV)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'ARV' AND XML1.MA_LY_DO_VVIEN == '1' AND XML1.MA_BENH_CHINH != 'Z20.6'",
    "CANH_BAO": "⛔ [TT 26/2025]: Thuốc ARV kê đơn ngoại trú diện BHYT chỉ thanh toán cho người nhiễm HIV hoặc phơi nhiễm nghề nghiệp (Z20.6).",
    "GHI_CHU": "RÀ SOÁT 21/03/2026: Sửa typo MA_BEN_CHINH→MA_BENH_CHINH (thiếu chữ H)",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_477",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_477",
    "TEN_QUY_TAC": "Thuốc đắt tiền (>10 triệu/lọ)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ [TT 37/2024]: Các loại thuốc có giá trị lớn (>10 triệu/đơn vị) cần có thông tin bác sĩ hội chẩn hoặc lãnh đạo khoa duyệt trước khi thực hiện.",
    "GHI_CHU": "Giữ OFF: XML2 QĐ 3176 không có MA_BS_HOI_CHAN; cần map từ DU_PHONG/hội chẩn nội bộ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_478",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_478",
    "TEN_QUY_TAC": "Thuốc điều trị Gout (Colchicin)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.29' AND XML2.SO_LUONG_NGAY > 3",
    "CANH_BAO": "⚠️ [CẢNH BÁO ĐỘC TÍNH]: Colchicin liều cao dùng nhiều ngày dễ gây tiêu chảy và ngộ độc. Cần tuân thủ phác đồ liều thấp của Bộ Y tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_479",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_479",
    "TEN_QUY_TAC": "Thuốc điều trị lao (Lao kháng thuốc)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'KHANG_LAO_G2' AND XML1.MA_LY_DO_VVIEN != '3'",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Thuốc kháng lao hàng 2 cần được hội chẩn và điều trị tại các cơ sở chuyên khoa Lao & Bệnh phổi hoặc theo chương trình chống lao.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_480",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_480",
    "TEN_QUY_TAC": "Thuốc điều trị loãng xương",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.321' AND XML1.MA_BENH_CHINH != 'M81' AND COUNT_IF(XML3, MA_DICH_VU == 'DO_LOANG_XUONG') == 0",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc điều trị loãng xương (Alendronic acid...) chỉ thanh toán khi có kết quả đo mật độ xương (T-score <= -2.5) hoặc có gãy xương bệnh lý.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_481",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_481",
    "TEN_QUY_TAC": "Thuốc điều trị loét dạ dày (H2)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'ANTIHISTAMINE_H2' AND XML2.SO_NGAY > 56",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc kháng H2 (Ranitidine, Famotidine...) dùng điều trị loét dạ dày tá tràng không được thanh toán quá 08 tuần (56 ngày).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_482",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_482",
    "TEN_QUY_TAC": "Thuốc điều trị rối loạn cương dương",
    "DIEU_KIEN": "( (XML2.MA_HOAT_CHAT == '40.541' OR XML2.TEN_THUOC REGEXP '(?i)(sildenafil|tadalafil|vardenafil|avanafil)') AND XML2.MA_THUOC != '40.540' AND XML2.MA_HOAT_CHAT != '40.540' AND NOT (XML2.TEN_THUOC REGEXP '(?i)(clopidogrel|vixcar|plavix|dogrelsavi|dogrel|clogrel|plagerl|ceruvin)') )",
    "CANH_BAO": "⛔ [LOẠI TRỪ]: Các thuốc ức chế Phosphodiesterase-5 (Sildenafil, Tadalafil...) không thuộc phạm vi thanh toán của quỹ BHYT.",
    "GHI_CHU": "SỬA 04/2026: 40.541 = PE5 (VD Vixcar), không phải PDE-5. Loại MA_THUOC/MA_HOAT 40.540; loại theo tên hoạt chất/thương mại clopidogrel; MA_HOAT_CHAT sai 40.540 nhưng tên Vixcar/clopidogrel không còn báo PDE-5.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_483",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_483",
    "TEN_QUY_TAC": "Thuốc điều trị viêm gan B/C",
    "DIEU_KIEN": "XML2.MA_NHOM == 'VIEM_GAN_VR' AND COUNT_IF(XML3, MA_DICH_VU IN ('XN_HBEAG','XN_HBV_DNA','XN_HCV_RNA')) == 0",
    "CANH_BAO": "⛔ [VBHN 15]: Thanh toán thuốc kháng virus viêm gan bắt buộc phải có kết quả định lượng tải lượng virus trong vòng 6 tháng gần nhất.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_484",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_484",
    "TEN_QUY_TAC": "Thuốc Filgrastim (G-CSF)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.236' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_CONG_THUC_MAU' AND item.NEUTROPHIL > 1.5) > 0",
    "CANH_BAO": "⚠️ [VBHN 15]: Cảnh báo sử dụng thuốc kích thích dòng bạch cầu khi chỉ số Neutrophil còn > 1.5 G/L (trừ các phác đồ hóa trị liều cao đặc biệt).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_485",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_485",
    "TEN_QUY_TAC": "Thuốc gây mê (Sevoflurane)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'GAY_ME_HIT' AND COUNT_IF(XML3, MA_NHOM IN ('1','2')) == 0",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc mê dạng hít chỉ thanh toán khi BN có thực hiện Phẫu thuật/Thủ thuật có chỉ định gây mê tại Bảng 3.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_486",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_486",
    "TEN_QUY_TAC": "Thuốc gây nghiện BN nhi < 12 tuổi",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 26/2025]: Trẻ dưới 12 tuổi dùng thuốc gây nghiện, đơn thuốc bắt buộc phải có số CCCD/Định danh của cha/mẹ hoặc người giám hộ.",
    "GHI_CHU": "Giữ OFF: XML2 QĐ 3176 không có CMND_NGUOI_THAN.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_487",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_487",
    "TEN_QUY_TAC": "Thuốc gây nghiện cho BN ung thư",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'GAY_NGHIEN' AND XML2.SO_NGAY > 30 AND XML1.MA_BENH_CHINH NOT LIKE 'C%'",
    "CANH_BAO": "⛔ [TT 26/2025]: Thuốc gây nghiện kê đơn ngoại trú chỉ được vượt quá 7 ngày (tối đa 30 ngày) cho bệnh nhân ung thư hoặc AIDS giai đoạn cuối.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_488",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_488",
    "TEN_QUY_TAC": "Thuốc gây nghiện thiếu địa chỉ",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'GAY_NGHIEN' AND IS_EMPTY(XML1.DIA_CHI)",
    "CANH_BAO": "⛔ [TT 26/2025]: Đơn thuốc gây nghiện bắt buộc phải có địa chỉ thường trú hoặc tạm trú chính xác của người bệnh trên hệ thống.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_489",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_489",
    "TEN_QUY_TAC": "Thuốc giãn cơ (Tiêm) ngoại trú",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND XML2.MA_NHOM == 'GIAN_CO' AND XML2.MA_DUONG_DUNG == '2.10'",
    "CANH_BAO": "⚠️ [TT 26/2025]: Thuốc giãn cơ dạng tiêm không khuyến khích kê đơn ngoại trú do yêu cầu theo dõi phản ứng sau tiêm tại cơ sở y tế.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_490",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_490",
    "TEN_QUY_TAC": "Thuốc giãn phế quản (Khí dung)",
    "DIEU_KIEN": "XML2.MA_NHOM == 'KHI_DUNG' AND COUNT_IF(XML3, MA_DICH_VU == 'DV_KHI_DUNG') == 0",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Thuốc dùng qua máy khí dung chỉ thanh toán khi có phát sinh dịch vụ kỹ thuật \"Thở khí dung\" tại Bảng 3.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_491",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_491",
    "TEN_QUY_TAC": "Thuốc hạ mỡ máu vs Men gan cao",
    "DIEU_KIEN": "XML2.MA_NHOM == 'STATIN' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_ALT' AND item.GIA_TRI > 150) > 0",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Tạm ngưng hoặc thận trọng dùng Statin khi men gan (ALT/AST) tăng > 3 lần giới hạn bình thường.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_492",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_492",
    "TEN_QUY_TAC": "Thuốc hỗ trợ (Bổ gan/não)",
    "DIEU_KIEN": "XML2.MA_NHOM IN ('BO_GAN','BO_NAO') AND XML2.THANH_TIEN_BV > (XML1.T_TONGCHI_BV * 0.2)",
    "CANH_BAO": "⚠️ [KIỂM SOÁT CP]: Chi phí thuốc hỗ trợ điều trị chiếm > 20% tổng chi phí thuốc của hồ sơ. Cơ quan BHXH thường xuyên kiểm tra tính hợp lý.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_493",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_493",
    "TEN_QUY_TAC": "Thuốc hỗ trợ (Thực phẩm chức năng)",
    "DIEU_KIEN": "XML2.TEN_THUOC LIKE '%Thực phẩm chức năng%' OR XML2.TEN_THUOC LIKE '%TPCN%'",
    "CANH_BAO": "⛔ [CẤM THANH TOÁN]: BHXH không thanh toán cho thực phẩm chức năng theo quy định tại Luật BHYT và VBHN 15/VBHN-BYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_494",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_494",
    "TEN_QUY_TAC": "Thuốc kháng nấm đặc hiệu",
    "DIEU_KIEN": "XML2.MA_NHOM == 'KHANG_NAM' AND COUNT_IF(XML3, MA_DICH_VU == 'SOI_NAM_CAY_NAM') == 0",
    "CANH_BAO": "⚠️ [HƯỚNG DẪN BYT]: Cần có bằng chứng vi sinh (Soi tươi/Cấy nấm) trước khi chỉ định thuốc kháng nấm hệ thống (trừ ca sốc nhiễm nấm).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_495",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_495",
    "TEN_QUY_TAC": "Thuốc kích thích rụng trứng",
    "DIEU_KIEN": "XML2.MA_NHOM == 'KICH_TRUNG' AND XML1.MA_BENH_CHINH IN ('N97','Z31')",
    "CANH_BAO": "⛔ [LOẠI TRỪ]: Thuốc hỗ trợ sinh sản và điều trị vô sinh (N97, Z31) không thuộc phạm vi chi trả của quỹ BHYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_496",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_496",
    "TEN_QUY_TAC": "Thuốc kiểm soát đặc biệt (H)",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'KS_DAC_BIET' AND XML2.MA_BAC_SI NOT IN (DANH_SACH_BS_DUOC_PHEP)",
    "CANH_BAO": "⛔ [TT 26/2025]: Thuốc kiểm soát đặc biệt chỉ được kê bởi bác sĩ đã được bệnh viện phân quyền bằng văn bản (Ghi vết trên chữ ký số).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_497",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_497",
    "TEN_QUY_TAC": "Thuốc lợi tiểu tiết kiệm Kali",
    "DIEU_KIEN": "XML2.MA_NHOM == 'LOI_TIEU_TK_K' AND COUNT_IF(XML2, MA_NHOM == 'ACEI' OR MA_NHOM == 'ARB') > 0",
    "CANH_BAO": "⚠️ [AN TOÀN]: Phối hợp thuốc lợi tiểu tiết kiệm Kali (Spironolactone) với thuốc ức chế men chuyển làm tăng nguy cơ tăng Kali máu nặng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_498",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_498",
    "TEN_QUY_TAC": "Thuốc Metformin vs Suy thận nặng",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.670' AND (XML1.MA_BENH_CHINH == 'N18.4' OR XML1.MA_BENH_CHINH == 'N18.5' OR XML1.MA_BENH_CHINH == 'N18.6')",
    "CANH_BAO": "⛔ [AN TOÀN]: Chống chỉ định Metformin khi độ thanh thải Creatinine (GFR) < 30ml/phút do nguy cơ nhiễm toan acid lactic.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_499",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_499",
    "TEN_QUY_TAC": "Thuốc Methotrexate ngoại trú",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.385' AND XML2.SO_NGAY > 7 AND XML1.MA_LOAI_KCB == '1'",
    "CANH_BAO": "⛔ [VBHN 15]: Methotrexate điều trị thấp khớp/vảy nến thường chỉ dùng liều đơn theo tuần. Kê đơn hàng ngày hoặc quá 7 ngày ngoại trú là sai liều độc.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_500",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_500",
    "TEN_QUY_TAC": "Thuốc ngoài danh mục (Hội chẩn)",
    "DIEU_KIEN": "XML2.PHAM_VI == 2 AND XML1.MA_LY_DO_VVIEN != '2'",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc ngoài danh mục BHYT của bệnh viện chỉ được thanh toán trong trường hợp hội chẩn đặc biệt hoặc chuyển tuyến cấp cứu.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_501",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_501",
    "TEN_QUY_TAC": "Thuốc ngoài danh mục BHYT",
    "DIEU_KIEN": "XML2.MA_THUOC NOT IN DM_THUOC.MA_THUOC_BHYT",
    "CANH_BAO": "⛔ [SAI DANH MỤC]: Thuốc không nằm trong danh mục được hưởng BHYT theo VBHN 15/VBHN-BYT.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_502",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_502",
    "TEN_QUY_TAC": "Thuốc pha chế thiếu mã dịch vụ",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'PHA_CHE' AND COUNT_IF(XML3, MA_DICH_VU == 'DV_SAC_THUOC') == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc do cơ sở tự pha chế/sắc thuốc chỉ thanh toán khi có phát sinh dịch vụ công pha chế/sắc thuốc tương ứng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_503",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_503",
    "TEN_QUY_TAC": "Thuốc pha chế từ Vị thuốc YHCT",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'PHA_CHE_YHCT' AND IS_EMPTY(XML2.MA_THANH_PHAN_THUOC)",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc pha chế/bào chế tại viện phải liệt kê danh sách mã các vị thuốc thành phần (Cột 21 Bảng 2) để làm căn cứ tính giá.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_504",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_504",
    "TEN_QUY_TAC": "Thuốc phải hội chẩn (G1)",
    "DIEU_KIEN": "DM_THUOC.DIEU_KIEN_TT == 'G1' AND XML1.MA_LY_DO_VVIEN == '1' AND COUNT_IF(XML3, MA_DV == 'HOI_CHAN') == 0",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Thuốc có điều kiện (G1) yêu cầu phải hội chẩn khi sử dụng nhưng chưa thấy thông tin dịch vụ hội chẩn.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_505",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_505",
    "TEN_QUY_TAC": "Thuốc phóng xạ không có tỷ lệ",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'RADIO' AND IS_EMPTY(XML2.TYLE_TT_BH)",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc phóng xạ và chất đánh dấu phải ghi rõ tỷ lệ sử dụng thực tế (Cột 14 Bảng 2).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_506",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_506",
    "TEN_QUY_TAC": "Thuốc phóng xạ thiếu đơn vị mCi",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'RADIO' AND XML2.DON_VI_TINH != 'mCi'",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc phóng xạ bắt buộc phải sử dụng đơn vị tính là mCi hoặc MBq để tính toán chi phí theo thời gian phân rã (Trang 20 TT 37).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_507",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_507",
    "TEN_QUY_TAC": "Thuốc phóng xạ thiếu mã thiết bị",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'RADIO' AND COUNT_IF(XML3, MA_DICH_VU IN ('PET_CT','SPECT')) == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc phóng xạ chỉ được thanh toán khi thực hiện cùng các kỹ thuật ghi hình chẩn đoán tương ứng (PET, SPECT).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_508",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_508",
    "TEN_QUY_TAC": "Thuốc Somatropin (Growth Hormone)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.662' AND XML1.MA_BENH_CHINH != 'E23.0' AND XML1.TUOI_NAM > 18",
    "CANH_BAO": "⛔ [VBHN 15]: Hormon tăng trưởng chỉ thanh toán cho trẻ em thiếu hụt GH bẩm sinh (E23.0). Không thanh toán cho mục đích tăng chiều cao đơn thuần.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_509",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_509",
    "TEN_QUY_TAC": "Thuốc Tenofovir ngoại trú (Viêm gan)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.235' AND XML1.MA_BENH_CHINH == 'B18.1' AND XML1.MA_LOAI_KCB == '1'",
    "CANH_BAO": "⚠️ [KIỂM SOÁT]: Kê đơn Tenofovir cho viêm gan B mạn tính cần đảm bảo BN có đầy đủ xét nghiệm men gan và tải lượng virus theo định kỳ 03-06 tháng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_510",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_510",
    "TEN_QUY_TAC": "Thuốc thải sắt (Deferasirox)",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.923' AND XML1.MA_BENH_CHINH NOT STARTS_WITH 'D56'",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc thải sắt chỉ thanh toán cho BN Thalassemia (D56) có tình trạng quá tải sắt (Ferritin > 1000 ng/ml).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_511",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_511",
    "TEN_QUY_TAC": "Thuốc thay thế dịch vụ (Cùng mã)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Khi sử dụng thuốc thay thế cho một phần của DVKT, tổng tiền thuốc không được vượt quá giá trị cấu thành trong giá DVKT đó.",
    "GHI_CHU": "Giữ OFF: XML2/XML3 không có MA_DVKT_THAY_THE/GIA_QUY_DINH theo schema QĐ 3176 đang dùng.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_512",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_512",
    "TEN_QUY_TAC": "Thuốc thay thế khác hoạt chất",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 26/2025]: Nghiêm cấm thay thế thuốc khác hoạt chất trong đơn thuốc mà không có sự hội chẩn hoặc chỉ định lại của bác sĩ.",
    "GHI_CHU": "Giữ OFF: XML2 không có TEN_THUOC_THAY_THE/MA_HOAT_CHAT_THAY_THE.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_513",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_513",
    "TEN_QUY_TAC": "Thuốc thay thế thiếu mã DVKT",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Khi kê thuốc thay thế cho DVKT (Cột 22 Bảng 2), mã DVKT đó phải có mặt đồng thời tại Bảng 3 để đối soát thanh toán.",
    "GHI_CHU": "Giữ OFF: XML2 không có MA_DVKT_THAY_THE.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_514",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_514",
    "TEN_QUY_TAC": "Thuốc tiêm/truyền ngoại trú",
    "DIEU_KIEN": "XML1.MA_LOAI_KCB == '1' AND XML2.MA_DUONG_DUNG IN ('2.10','2.15') AND XML1.MA_BENH_CHINH != 'CUP_CUU'",
    "CANH_BAO": "⚠️ [TT 26/2025]: Hạn chế kê đơn thuốc tiêm, truyền tĩnh mạch trong điều trị ngoại trú trừ trường hợp cấp cứu hoặc thuốc đặc thù được BYT cho phép.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_515",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_515",
    "TEN_QUY_TAC": "Thuốc tự chế từ vị thuốc (Giá)",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⛔ [TT 37/2024]: Giá thuốc tự pha chế không được cao hơn tổng giá các thành phần (vị thuốc/hóa dược) cộng với công sắc/pha chế quy định.",
    "GHI_CHU": "✏️ [Production review] Vô hiệu hóa trước deploy: rule cần cấu trúc thành phần pha chế MA_THANH_PHAN_THUOC.GIA không tồn tại trong schema XML đang dùng; SUM() trên cấu trúc lồng cũng không tương thích engine hiện tại.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_516",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_516",
    "TEN_QUY_TAC": "Thuốc tự mua - Thiếu số hóa đơn",
    "DIEU_KIEN": "1 == 0",
    "CANH_BAO": "⚠️ [TT 37/2024]: Thuốc bệnh nhân tự mua để BHYT thanh toán lại trực tiếp cần lưu trữ số hóa đơn tài chính trên hệ thống để đối soát.",
    "GHI_CHU": "Giữ OFF: XML2 không có SO_HOA_DON_VAT; có thể map từ DU_PHONG khi có quy ước nội bộ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_517",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_517",
    "TEN_QUY_TAC": "Thuốc tự túc không ghi chú",
    "DIEU_KIEN": "XML2.T_BNTT > 0 AND XML2.T_BHTT == 0 AND IS_EMPTY(XML2.GHI_CHU_BN)",
    "CANH_BAO": "⛔ [TT 37/2024]: Trường hợp bệnh nhân tự mua thuốc do BV thiếu, bắt buộc phải ghi rõ lý do và sự đồng ý của BN vào cột Ghi chú để đối soát.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_518",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_518",
    "TEN_QUY_TAC": "Thuốc tự túc thiếu sự đồng ý",
    "DIEU_KIEN": "XML2.T_BNTT > 0 AND XML2.T_BHTT == 0 AND XML2.GHI_CHU_BN NOT LIKE '%Đồng ý%'",
    "CANH_BAO": "⛔ [TT 37/2024]: Đối với thuốc bệnh nhân tự mua, hồ sơ phải ghi nhận sự đồng ý của bệnh nhân trong trường Ghi chú tại Bảng 2.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_519",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_519",
    "TEN_QUY_TAC": "Thuốc tỷ lệ thanh toán (30/50/70)",
    "DIEU_KIEN": "DM_THUOC.TYLE_TT < 100 AND XML2.TYLE_TT_BH != DM_THUOC.TYLE_TT",
    "CANH_BAO": "⛔ [VBHN 15]: Áp sai tỷ lệ thanh toán BHYT đối với các thuốc có quy định tỷ lệ (VD: Thuốc điều trị ung thư chỉ hưởng 50% hoặc 70%).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_520",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_520",
    "TEN_QUY_TAC": "Thuốc Ung thư sai chuyên khoa",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'UNG_THU' AND DM_NHAN_SU.LINH_VUC != 'UNG_BIEU'",
    "CANH_BAO": "⛔ [VBHN 15]: Thuốc điều trị ung thư bắt buộc phải do bác sĩ chuyên khoa Ung bướu hoặc Huyết học truyền máu chỉ định.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_521",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_521",
    "TEN_QUY_TAC": "Thuốc ung thư thiếu đợt điều trị",
    "DIEU_KIEN": "DM_THUOC.LOAI == 'UNG_THU' AND IS_EMPTY(XML2.DU_PHONG) AND IS_EMPTY(XML2.GHI_CHU_BN)",
    "CANH_BAO": "⛔ [TT 37/2024]: Thuốc hóa trị liệu bắt buộc phải ghi rõ số đợt điều trị (Cycle) trong trường Ghi chú hoặc cấu trúc mở rộng của Bảng 2.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_522",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_522",
    "TEN_QUY_TAC": "Thuốc Warfarin vs Xét nghiệm INR",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == '40.252' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_PT_INR') == 0",
    "CANH_BAO": "⛔ [AN TOÀN]: Điều trị bằng Warfarin bắt buộc phải xét nghiệm chỉ số INR định kỳ để chỉnh liều, tránh nguy cơ xuất huyết nội tạng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_523",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_523",
    "TEN_QUY_TAC": "Thuốc xịt (Asthma) thiếu thiết bị",
    "DIEU_KIEN": "XML2.MA_DUONG_DUNG == '5.01' AND COUNT_IF(XML3, MA_VAT_TU == 'BUONG_DEM') == 0 AND XML1.TUOI_NAM < 6",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Trẻ dưới 6 tuổi dùng thuốc xịt định liều (MDI) cần kèm theo buồng đệm (Spacer) để đảm bảo hiệu quả điều trị.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_524",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_524",
    "TEN_QUY_TAC": "Trẻ em < 72 tháng thiếu cân nặng",
    "DIEU_KIEN": "XML1.TUOI_NGAY <= 2190 AND IS_EMPTY(XML1.CAN_NANG)",
    "CANH_BAO": "⛔ [TT 26/2025]: Trẻ dưới 72 tháng tuổi khi kê đơn ngoại trú bắt buộc phải ghi cân nặng để kiểm soát liều dùng an toàn.",
    "GHI_CHU": "SỬA 21/03/2026: Thay TUOI_NGAY bằng DATEDIFF(NGAY_SINH). TUOI_NGAY không tồn tại trong XML1 QĐ 130 → NULL<=2190=TRUE → flag sai BN 56-73 tuổi là trẻ em. 3 ca FP.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_525",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_525",
    "TEN_QUY_TAC": "Trùng hoạt chất (Đơn/Phối hợp)",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_HOAT_CHAT == 'A') > 0 AND COUNT_IF(XML2, MA_HOAT_CHAT == 'A+B') > 0",
    "CANH_BAO": "⛔ [AN TOÀN BN]: Không thanh toán đồng thời thuốc phối hợp và thuốc đơn lẻ có chứa cùng một hoạt chất (Nguy cơ quá liều).",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_526",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_526",
    "TEN_QUY_TAC": "Trùng lặp ACEI và ARB",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_NHOM == 'ACEI') > 0 AND COUNT_IF(XML2, MA_NHOM == 'ARB') > 0",
    "CANH_BAO": "⛔ [AN TOÀN]: Phối hợp thuốc ức chế men chuyển và ức chế thụ thể Angiotensin II làm tăng nguy cơ suy thận và tăng kali máu nặng.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_527",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_527",
    "TEN_QUY_TAC": "Trùng lặp NSAID (Nguy cơ loét)",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_NHOM == 'NSAID') > 1",
    "CANH_BAO": "⚠️ [LÂM SÀNG]: Kê đồng thời 02 loại thuốc giảm đau hạ sốt không steroid (NSAIDs). Nguy cơ cao gây xuất huyết tiêu hóa và suy thận.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_528",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_528",
    "TEN_QUY_TAC": "Truyền Khối tiểu cầu",
    "DIEU_KIEN": "XML2.MA_HOAT_CHAT == 'PLATELETS' AND COUNT_IF(XML3, MA_DICH_VU == 'XN_TIEU_CAU' AND item.GIA_TRI > 50) > 0",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Chỉ định truyền tiểu cầu khi số lượng tiểu cầu của BN > 50G/L. Cần hội chẩn lâm sàng để tránh xuất toán lãng phí.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_529",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_529",
    "TEN_QUY_TAC": "Tương tác thuốc (Chống đông + NSAID)",
    "DIEU_KIEN": "COUNT_IF(XML2, MA_NHOM == 'ANTICOAGULANT') > 0 AND COUNT_IF(XML2, MA_NHOM == 'NSAID') > 0",
    "CANH_BAO": "⚠️ [AN TOÀN JCI]: Phối hợp thuốc chống đông và NSAID làm tăng nguy cơ xuất huyết tiêu hóa lên gấp 3-5 lần. Cần cân nhắc thay thế bằng Paracetamol.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_530",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_530",
    "TEN_QUY_TAC": "Thuốc điều trị ung thư (DM LOAI=UNG_THU) không có GPB",
    "DIEU_KIEN": "XML1.MA_BENH_CHINH STARTS_WITH 'C' AND COUNT_IF(XML3, MA_DICH_VU == 'GIAI_PHAU_BENH') == 0 AND DM_THUOC.LOAI == 'UNG_THU'",
    "CANH_BAO": "⛔ [VBHN 15]: Thanh toán thuốc điều trị ung thư bắt buộc phải có kết quả giải phẫu bệnh hoặc bằng chứng tế bào học khẳng định ác tính (chỉ áp cho dòng thuốc thuộc nhóm điều trị ung thư trên đơn).",
    "GHI_CHU": "Engine: THUOC_530 — chỉ cảnh báo dòng XML2 có MA_THUOC khớp DM với LOAI=UNG_THU; thuốc thường cùng hồ sơ không kích hoạt. GPB: MA_DICH_VU/MA_DV = GIAI_PHAU_BENH trên XML3.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_531",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_531",
    "TEN_QUY_TAC": "Vị thuốc YHCT thiếu nguồn gốc",
    "DIEU_KIEN": "XML2.LOAI_THUOC == 'VI_THUOC' AND IS_EMPTY(XML2.NGUON_GOC_YHCT)",
    "CANH_BAO": "⛔ [TT 37/2024]: Vị thuốc y học cổ truyền phải ghi rõ nguồn gốc (Bắc/Nam/Nhập khẩu) tại cột Ghi chú để áp giá thanh toán chính xác.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_532",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_532",
    "TEN_QUY_TAC": "Vitamin không kèm bệnh lý",
    "DIEU_KIEN": "XML2.MA_NHOM == 'VITAMIN' AND XML1.MA_BENH_CHINH IN ('Z00','Z01')",
    "CANH_BAO": "⛔ [VBHN 15]: Không thanh toán Vitamin, khoáng chất cho các trường hợp đi khám sức khỏe hoặc không có chẩn đoán bệnh lý thiếu hụt cụ thể.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_533",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_533",
    "TEN_QUY_TAC": "Wamlox: Liều/ngày, trần 2 viên/ngày, nhất quán SL",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.30.501' AND THUOC_533_VI_PHAM_WAMLOX(XML1, XML2)",
    "CANH_BAO": "⚠️ [KIỂM TRA]: Wamlox (40.30.501) — liều trong ngày = SL_MOI_LAN × TAN_SUAT (hoặc SL_MOI_NGAY khi parse được) không được vượt 2 viên/ngày; SO_LUONG phải bằng liều/ngày × SO_NGAY (nếu có số ngày) hoặc bằng liều/ngày khi không khai SO_NGAY.",
    "GHI_CHU": "",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_534",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_534",
    "TEN_QUY_TAC": "Thiếu Mã bệnh chẩn đoán chính",
    "DIEU_KIEN": "HAS_FIELD(XML1, 'MA_BENH_CHINH') AND (IS_EMPTY(XML1.MA_BENH_CHINH) OR TRIM(XML1.MA_BENH_CHINH) == '')",
    "CANH_BAO": "🔴 [DỮ LIỆU BẮT BUỘC]: Mã bệnh chẩn đoán chính (MA_BENH_CHINH) không được để trống. Đây là trường bắt buộc theo QĐ 3176/QĐ-BYT (Phụ lục Mẫu XML1, trường MA_BENH_CHINH).",
    "GHI_CHU": "SỬA 21/03/2026: Chuẩn hóa tham chiếu từ QĐ 4210/QĐ-BYT → QĐ 3176/QĐ-BYT theo Quyết định 130 hiện hành. QĐ 4210 đã hết hiệu lực, thay thế bởi QĐ 3176.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_535",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_535",
    "TEN_QUY_TAC": "[MỨC HƯỞNG]: Trẻ em dưới 6 tuổi hưởng 100%",
    "DIEU_KIEN": "XML1.MA_THE_BHYT LIKE 'TE%' AND XML1.TUOI_NGAY <= 2190 AND XML2.MUC_HUONG != 100",
    "CANH_BAO": "⛔ [MỨC HƯỞNG]: Đối tượng Trẻ em dưới 6 tuổi (thẻ BHYT mã TE) bắt buộc hưởng mức 100% theo Luật BHYT Điều 22.",
    "GHI_CHU": "KIỂM TRA 21/03/2026: Luật hợp lệ ✅. Điều kiện kiểm tra thẻ TE + tuổi ≤2190 ngày + mức hưởng ≠100% - đúng Luật BHYT Điều 22 Khoản 3.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_536",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_536",
    "TEN_QUY_TAC": "Mã bệnh chính không có trong từ điển ICD-10 quốc tế",
    "DIEU_KIEN": "LEN(TRIM(XML1.MA_BENH_CHINH)) > 0 AND UPPER(TRIM(XML1.MA_BENH_CHINH)) NOT IN (DM_ICD10)",
    "CANH_BAO": "⛔ [LỖI DANH MỤC]: Mã bệnh chính không có trong từ điển ICD-10 quốc tế. Kiểm tra lại mã bệnh đã nhập.",
    "GHI_CHU": "KIỂM TRA 21/03/2026: Luật hợp lệ ✅. Đối chiếu danh mục ICD-10 theo QĐ 3176 Phụ lục 01 (DM_ICD10). Mã bệnh chính phải thuộc danh mục ICD-10 quốc tế.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_537",
    "TRANG_THAI": "OFF",
    "MA_LUAT": "THUOC_537",
    "TEN_QUY_TAC": "JCI Safety: Trường thông tin dị ứng không được để trống",
    "DIEU_KIEN": "IS_EMPTY(XML1.GHI_CHU)",
    "CANH_BAO": "⚠️ [JCI Safety]: Trường thông tin dị ứng không được để trống (Phải ghi \"Không\" nếu không có). Theo tiêu chuẩn JCI IPSG.",
    "GHI_CHU": "OFF sau đối chiếu gói 177 (04/03/2026): 177/177 hồ sơ GHI_CHU trống — proxy không phải vi phạm Luật BHYT; gây ~100% cảnh báo và nhiễu huấn luyện AI. Bật lại chỉ khi audit an toàn/JCI có quy ước HIS map vào GHI_CHU.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_538",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_538",
    "TEN_QUY_TAC": "Lỗi kế toán: Tổng tiền lệch quá 5 đồng so với tổng các nguồn thanh toán",
    "DIEU_KIEN": "ABS(TO_NUMBER(XML1.T_TONGCHI_BV) - (TO_NUMBER(XML1.T_BHTT) + TO_NUMBER(XML1.T_BNTT) + TO_NUMBER(XML1.T_NGUONKHAC) + TO_NUMBER(XML1.T_NGOAIDS) + TO_NUMBER(XML1.T_BNCCT))) > 5",
    "CANH_BAO": "⛔ [LỖI KẾ TOÁN]: Tổng tiền (T_TONGCHI_BV) lệch quá 5 đồng so với tổng các nguồn thanh toán (T_BHTT + T_BNTT + T_NGUONKHAC + T_NGOAIDS + T_BNCCT). Kiểm tra lại số liệu.",
    "GHI_CHU": "SỬA 10/04/2026: TO_NUMBER đủ hạng + T_NGOAIDS; đồng bộ với tinhChenhTongChi (dong_co_giam_dinh) và XML_04/XML_107/HC_242. Đối chiếu gói 177: báo cáo cũ 132× FP do biểu thức cũ.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_539",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_539",
    "TEN_QUY_TAC": "[XUẤT TOÁN]: Desloratadin (Sosallergy/Setbozi) — chỉ định ICD TT",
    "DIEU_KIEN": "XML2.MA_THUOC == '40.82' AND NOT (XML1.MA_BENH_CHINH REGEXP 'J06\\.8|J06\\.9|J39\\.3|J39\\.8|J39\\.9|J68\\.2|L20\\.0|L28\\.2|L29\\.0|L29\\.1|L29\\.2|L29\\.3|L29\\.8|L29\\.9|J06(?:$|[;,\\\\s|/])|J39(?:$|[;,\\\\s|/])|L29(?:$|[;,\\\\s|/])' OR XML1.MA_BENH_KT REGEXP 'J06\\.8|J06\\.9|J39\\.3|J39\\.8|J39\\.9|J68\\.2|L20\\.0|L28\\.2|L29\\.0|L29\\.1|L29\\.2|L29\\.3|L29\\.8|L29\\.9|J06(?:$|[;,\\\\s|/])|J39(?:$|[;,\\\\s|/])|L29(?:$|[;,\\\\s|/])' OR XML1.CHAN_DOAN_RV REGEXP '(?i)(VIÊM MŨI DỊ ỨNG|MÀY ĐAY|VIÊM KẾT MẠC DỊ ỨNG|NHIỄM TRÙNG ĐƯỜNG HÔ HẤP TRÊN|NHIỄM TRÙNG ĐƯỜNG HÔ HẤP TRÊN, KHÔNG PHÂN LOẠI|CÁC NHIỄM TRÙNG ĐƯỜNG HÔ HẤP TRÊN|CÁC NHIỄM TRÙNG ĐƯỜNG HÔ HẤP TRÊN KHÁC Ở NHIỀU VỊ TRÍ|CÁC BỆNH KHÁC CỦA ĐƯỜNG HÔ HẤP TRÊN|PHẢN ỨNG QUÁ MẪU ĐƯỜNG HÔ HẤP TRÊN, VỊ TRÍ KHÔNG XÁC ĐỊNH|BỆNH LÝ XÁC ĐỊNH KHÁC CỦA ĐƯỜNG HÔ HẤP TRÊN|BỆNH CỦA ĐƯỜNG HÔ HẤP TRÊN, KHÔNG ĐẶC HIỆU|VIÊM ĐƯỜNG HÔ HẤP TRÊN DO HÓA CHẤT|SẨN NGỨA BESNIER|SẨN NGỨA KHÁC|SẨN NGỨA|NGỨA HẬU MÔN|NGỨA BÌU|NGỨA ÂM HỘ|NGỨA HẬU MÔN - SINH DỤC|NGỨA KHÔNG ĐẶC HIỆU|NGỨA KHÁC|NGỨA)')",
    "CANH_BAO": "⛔ [XUẤT TOÁN]: Sosallergy/Setbozi ([40.82]) chỉ TT khi chỉ định đúng nhóm bệnh theo TT. Mã ICD được TT: J06; J06.8; J06.9; J39; J39.3; J39.8; J39.9; J68.2; L20.0; L28.2; L29; L29.0; L29.1; L29.2; L29.3; L29.8; L29.9. Tương ứng (rút gọn): nhiễm/ bệnh lý đường hô hấp trên (J06, J39…); viêm HH trên do hóa chất khí (J68.2); Besnier L20.0; sẩn ngứa L28.2; các thể ngứa L29.x. Chi tiết thuốc: [40.82] Setbozi.",
    "GHI_CHU": "Cập nhật 19/04/2026: Thay chỉ định cũ J30/L50/H10.1 bằng danh mục ICD TT (J06/J39/J68.2/L20/L28/L29…). Regex J06/J39/L29 có nhánh ngăn nhầm J06.x trái TT (vd J06.0); bổ sung khớp CHẨN ĐOÁN RV theo cụm bệnh học đối chiếu user.",
    "NGUON_DU_LIEU": "DuLieu_LUAT_THUOC (9).xlsx"
  },
  {
    "id": "SEED_THUOC_540",
    "TRANG_THAI": "ON",
    "MA_LUAT": "THUOC_540",
    "MUC_DO": "Critical",
    "TEN_QUY_TAC": "[Hydrochlorothiazide / HCT] Chống chỉ định (ICD gút, acid uric, vô niệu, Addison, tăng calci, suy gan/thận nặng)",
    "DIEU_KIEN": "NOT IS_EMPTY(XML2.MA_THUOC) AND ENGINE_RULE_THUOC_540",
    "CANH_BAO": "⛔ [NGUY HIỂM / CHỐNG CHỈ ĐỊNH]: Thuốc có Hydrochlorothiazide (HCT/HCTZ, kể cả phối hợp hạ áp) — bệnh nhân có ICD-10 chính/kèm: gút (M10, M1A), tăng acid uric máu (E79.0), vô niệu/thiểu niệu (R34), suy tuyến thượng thận/Addison (E27.4), tăng calci máu (E83.52), suy thận giai đoạn cuối/nặng (N18.4–N18.6), suy gan nặng (K72.*). Kê đơn không phù hợp chống chỉ định — đối chiếu SmPC và hồ sơ lâm sàng.",
    "GHI_CHU": "Engine: dong_co_giam_dinh — nhận diện tên/hoạt chất (XML2 + DM thuốc BV); ICD qua tachMaIcd (MA_BENH_CHINH, MA_BENH_KT, MA_BENHKEM).",
    "NGUON_DU_LIEU": "engine_THUOC_540_HCT_ICD"
  }
];
