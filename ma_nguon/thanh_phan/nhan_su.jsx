/**
 * DANH MỤC NHÂN LỰC THỰC HIỆN KHÁM BỆNH CHỮA BỆNH BẢO HIỂM Y TẾ
 * Cấu trúc chuẩn theo: Mẫu số 02/DM ban hành kèm theo Thông tư 12/2026/TT-BTC
 */

export const DANH_MUC_NHAN_SU = [
  {
    STT: 1, // Định dạng: Số. Số thứ tự
    
    MA_KHOA: "K03", // Định dạng: Chuỗi. Mã khoa lâm sàng, cận lâm sàng, khám bệnh theo danh mục dùng chung do Bộ Y tế ban hành
    
    TEN_KHOA: "Khoa Nội tổng hợp", // Định dạng: Chuỗi. Tên khoa/chuyên khoa khám bệnh
    
    HO_TEN: "Nguyễn Văn A", // Định dạng: Chuỗi. Họ và tên người hành nghề
    
    GIOI_TINH: 1, // Định dạng: Số. 1: Nam; 2: Nữ; 3: Chưa xác định
    
    SO_DINH_DANH: "012345678901", // Định dạng: Chuỗi. Số căn cước công dân hoặc số định danh cá nhân
    
    CHUCDANH_NN: "1", // Định dạng: Chuỗi. 1: Bác sỹ, 2: Y sỹ, 3: Điều dưỡng, 4: Hộ sinh, 5: Kỹ thuật y, 6: Cử nhân tâm lý lâm sàng, 7: Lương y, 8: Dược sỹ, 9: Người tham gia KBCB không cần CCHN
    
    VI_TRI: "1", // Định dạng: Chuỗi. 1: Chịu trách nhiệm CM; 2: Trưởng khoa/đơn nguyên; 3: Chịu trách nhiệm CM kiêm Trưởng khoa; 4: Đứng đầu cơ sở KBCB; 5: Phụ trách khoa; 6: Ủy quyền
    
    MACCHN: "001234/CT-CCHN", // Định dạng: Chuỗi. Số, ký hiệu của giấy phép hành nghề
    
    NGAYCAP_CCHN: "20150624", // Định dạng: Chuỗi (YYYYMMDD). Thời điểm cấp giấy phép hành nghề
    
    NOICAP_CCHN: "Sở Y tế TP. Cần Thơ", // Định dạng: Chuỗi. Tên cơ quan cấp giấy phép hành nghề
    
    PHAMVI_CM: "Nội khoa", // Định dạng: Chuỗi. Phạm vi hành nghề theo GPHN. Nhiều chuyên khoa cách nhau bằng dấu ";"
    
    PHAMVI_CMBS: "", // Định dạng: Chuỗi (YYYYMMDD_Z). Ngày và số quyết định điều chỉnh phạm vi hành nghề (nếu có)
    
    DVKT_KHAC: "", // Định dạng: Chuỗi. Mã DVKT phân công thực hiện ngoài phạm vi (07 ký tự đầu). Cách nhau bằng ";"
    
    VB_PHANCONG: "", // Định dạng: Chuỗi (YYYYMMDD_Z). Ngày và số văn bản phân công DVKT ngoài phạm vi
    
    THOIGIAN_DK: 1, // Định dạng: Số. 1: Toàn thời gian; 2: Không toàn thời gian
    
    THOIGIAN_NGAY: "0700-1100;1300-1700", // Định dạng: Chuỗi. Thời gian làm việc trong ngày (HHMM-HHMM), không ghi thời gian trực
    
    THOIGIAN_TUAN: "T2T3T4T5T6", // Định dạng: Chuỗi. Ngày làm việc trong tuần (T2, T3... CN)
    
    CSKCB_KHAC: "", // Định dạng: Chuỗi. Mã các cơ sở KBCB khác nơi đăng ký làm việc, cách nhau ";"
    
    CSKCB_CGKT: "", // Định dạng: Chuỗi. Mã cơ sở KBCB chuyển giao kỹ thuật (nếu có)
    
    QD_CGKT: "", // Định dạng: Chuỗi (YYYYMMDD_Z). Văn bản giao thực hiện chuyển giao kỹ thuật
    
    TU_NGAY: "20260401", // Định dạng: Chuỗi (YYYYMMDD). Ngày hợp đồng có hiệu lực hoặc thời điểm áp dụng điều chỉnh
    
    DEN_NGAY: "", // Định dạng: Chuỗi (YYYYMMDD). Ngày ngừng áp dụng
    
    MA_CSKCB: "80001" // Định dạng: Chuỗi. Mã cơ sở khám bệnh, chữa bệnh
  },
  {
    STT: 2,
    MA_KHOA: "K01", 
    TEN_KHOA: "Khoa Khám bệnh",
    HO_TEN: "Trần Thị B",
    GIOI_TINH: 2,
    SO_DINH_DANH: "098765432109",
    CHUCDANH_NN: "3", 
    VI_TRI: "",
    MACCHN: "005678/CT-CCHN",
    NGAYCAP_CCHN: "20181015",
    NOICAP_CCHN: "Sở Y tế TP. Cần Thơ",
    PHAMVI_CM: "Điều dưỡng",
    PHAMVI_CMBS: "",
    DVKT_KHAC: "",
    VB_PHANCONG: "",
    THOIGIAN_DK: 1,
    THOIGIAN_NGAY: "0700-1100;1300-1700",
    THOIGIAN_TUAN: "T2T3T4T5T6T7",
    CSKCB_KHAC: "",
    CSKCB_CGKT: "",
    QD_CGKT: "",
    TU_NGAY: "20260401",
    DEN_NGAY: "",
    MA_CSKCB: "80001"
  }
];