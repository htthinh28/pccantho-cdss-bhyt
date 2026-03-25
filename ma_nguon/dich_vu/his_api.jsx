/**
 * ============================================================
 * FILE: dich_vu/his_api.jsx (PHIÊN BẢN 4.0 - ĐA PHƯƠNG THỨC & GIẢI MÃ)
 * MỤC ĐÍCH: Cung cấp Adapter kết nối đa giao thức với HIS và 
 * Xử lý giải mã XML 130/QĐ-BYT chuẩn JCI.
 * KIẾN TRÚC: Facade Pattern + Adapter Pattern
 * ============================================================
 */

// ======================================================================
// PHẦN 1: CẤU HÌNH KẾT NỐI (Lấy từ biến môi trường hoặc file config)
// ======================================================================
const HIS_CONFIG = {
  REST_BASE_URL: process.env.REACT_APP_HIS_REST_URL || "http://10.0.0.1:8080/api",
  SOAP_WSDL_URL: process.env.REACT_APP_HIS_SOAP_URL || "http://10.0.0.1:8081/HisService.asmx",
  WEBSOCKET_URL: process.env.REACT_APP_HIS_WS_URL || "ws://10.0.0.1:8082/realtime",
  TOKEN: localStorage.getItem("HIS_ACCESS_TOKEN") || "",
};

// ======================================================================
// PHẦN 2: LÕI GIẢI MÃ & BÓC TÁCH XML 130 (Giữ nguyên logic cực tốt của bạn)
// ======================================================================

const giaiMaBase64 = (base64Str) => {
  try {
    if (!base64Str) return "";
    const binaryStr = atob(base64Str.trim());
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.error("[his_api] Lỗi giải mã Base64:", e);
    return "";
  }
};

const getTagValue = (element, tagName) => {
  const node = element.getElementsByTagName(tagName)[0];
  return node ? node.textContent.trim() : "";
};

const parseInnerXML = (xmlRaw, loaiHoso) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlRaw, "text/xml");
  let ketQua = [];

  const mapTags = {
    'XML1': 'TONG_HOP', 'XML2': 'CHI_TIET_THUOC', 'XML3': 'CHI_TIET_DVKT',
    'XML4': 'CHI_TIET_CLS', 'XML5': 'CHI_TIET_DIEN_BIEN_BENH',
    'XML6': 'CHI_TIET_THANH_TOAN', 
    'XML11': 'CHI_TIEU_DU_LIEU_GIAY_CHUNG_NHAN_NGHI_VIEC_HUONG_BAO_HIEM_XA_HOI'
  };

  const tagName = mapTags[loaiHoso] || 'HOSO';
  const items = xmlDoc.getElementsByTagName(tagName);

  for (let i = 0; i < items.length; i++) {
    let obj = {};
    const childNodes = items[i].children;
    for (let j = 0; j < childNodes.length; j++) {
      obj[childNodes[j].nodeName] = childNodes[j].textContent.trim();
    }
    ketQua.push(obj);
  }
  return loaiHoso === 'XML1' ? (ketQua[0] || {}) : ketQua;
};

export const xuLyFileXML130 = (rawXMLString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXMLString, "text/xml");
    const listFileHoso = xmlDoc.getElementsByTagName('FILEHOSO');
    
    if (listFileHoso.length > 0) {
      let hoSoGop = { xml1: {}, xml2: [], xml3: [], xml4: [], xml5: [], xml6: [], _raw: {} };

      for (let i = 0; i < listFileHoso.length; i++) {
        const loai = getTagValue(listFileHoso[i], 'LOAIHOSO').toUpperCase();
        const base64Content = getTagValue(listFileHoso[i], 'NOIDUNGFILE');

        if (base64Content) {
          const dataParsed = parseInnerXML(giaiMaBase64(base64Content), loai);
          hoSoGop[loai.toLowerCase()] = dataParsed;
        }
      }
      return [hoSoGop];
    }
    return [];
  } catch (err) {
    console.error("[his_api] Lỗi xử lý XML 130:", err);
    return [];
  }
};

export const validateHoSo = (hoSo) => {
  let errors = [];
  const xml1 = hoSo.xml1 || {};
  if (!xml1.MA_LK) errors.push("Thiếu Mã lượt khám (MA_LK)");
  if (!xml1.HO_TEN) errors.push("Thiếu Họ tên bệnh nhân (HO_TEN)");
  if (!xml1.MA_THE_BHYT && !xml1.MA_THE) errors.push("Thiếu Mã thẻ BHYT");
  return { hop_le: errors.length === 0, danh_sach_loi: errors };
};


// ======================================================================
// PHẦN 3: NETWORK ADAPTERS - KẾT NỐI ĐA PHƯƠNG THỨC (PHẦN NÂNG CẤP)
// ======================================================================

class HisConnector {
  constructor() {
    this.ws = null;
  }

  // Phương thức dùng chung để xử lý HTTP Response
  async _handleResponse(response, isXml = false) {
    if (!response.ok) {
      throw new Error(`[HIS API Error] HTTP Status: ${response.status}`);
    }
    return isXml ? await response.text() : await response.json();
  }

  // --- 1. PHƯƠNG THỨC RESTful API (Chuẩn JSON hiện đại) ---
  // Thường dùng để lấy thông tin bệnh nhân, gửi CDSS
  async fetchREST(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HIS_CONFIG.TOKEN}`
        }
      };
      if (data) options.body = JSON.stringify(data);

      const response = await fetch(`${HIS_CONFIG.REST_BASE_URL}${endpoint}`, options);
      return await this._handleResponse(response);
    } catch (error) {
      console.error("[REST HIS] Lỗi kết nối:", error);
      throw error;
    }
  }

  // --- 2. PHƯƠNG THỨC SOAP / XML (Chuẩn giao tiếp y tế cũ, eBH, VNPT HIS...) ---
  // Thường dùng để nộp XML 130 trực tiếp lên cổng hoặc HIS Server
  async fetchSOAP(actionName, xmlBody) {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:his="http://tempuri.org/">
         <soapenv:Header>
            <his:AuthHeader><Token>${HIS_CONFIG.TOKEN}</Token></his:AuthHeader>
         </soapenv:Header>
         <soapenv:Body>${xmlBody}</soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      const response = await fetch(HIS_CONFIG.SOAP_WSDL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': `http://tempuri.org/${actionName}`
        },
        body: soapEnvelope
      });
      const xmlResponse = await this._handleResponse(response, true);
      // Có thể dùng DOMParser ở đây để bóc tách kết quả SOAP nếu cần
      return xmlResponse; 
    } catch (error) {
      console.error("[SOAP HIS] Lỗi kết nối:", error);
      throw error;
    }
  }

  // --- 3. PHƯƠNG THỨC WEBSOCKET (Real-time) ---
  // Dùng để lắng nghe khi có bệnh nhân mới quét thẻ BHYT, có kết quả CLS
  connectWebSocket(onMessageCallback) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${HIS_CONFIG.WEBSOCKET_URL}?token=${HIS_CONFIG.TOKEN}`);

    this.ws.onopen = () => console.log("[WS HIS] Đã kết nối thời gian thực.");
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageCallback(data);
      } catch (e) {
        // Fallback xử lý nếu HIS trả về XML qua Socket thay vì JSON
        onMessageCallback(event.data); 
      }
    };
    this.ws.onerror = (err) => console.error("[WS HIS] Lỗi:", err);
    this.ws.onclose = () => {
      console.log("[WS HIS] Đã ngắt kết nối. Thử kết nối lại sau 5s...");
      setTimeout(() => this.connectWebSocket(onMessageCallback), 5000);
    };
  }

  disconnectWebSocket() {
    if (this.ws) this.ws.close();
  }

  // ======================================================================
  // PHẦN 4: HÀM TỔNG HỢP NGHIỆP VỤ (BUSINESS LOGIC)
  // ======================================================================

  /**
   * Lấy XML 130 từ HIS thông qua REST API, giải mã và trả về object hoàn chỉnh
   * @param {string} maLuotKham - Mã lượt khám (Mã Hồ sơ)
   */
  async getAndParseXML130FromHIS(maLuotKham) {
    try {
      // 1. Gọi API lấy chuỗi XML thô (Base64 Envelope) từ HIS
      const response = await this.fetchREST(`/hoso130/${maLuotKham}`, 'GET');
      
      // Giả sử HIS trả về: { status: 200, data: "<Envelope>...</Envelope>" }
      const rawXml = response.data; 

      // 2. Sử dụng hàm giải mã của bạn
      const hoSoParsed = xuLyFileXML130(rawXml);

      if (hoSoParsed.length === 0) throw new Error("Không thể bóc tách file XML");
      
      // 3. Validate chuẩn JCI/BHYT
      const validation = validateHoSo(hoSoParsed[0]);
      
      return {
        success: true,
        data: hoSoParsed[0],
        isValid: validation.hop_le,
        errors: validation.danh_sach_loi
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export một Singleton Instance để dùng chung trên toàn ứng dụng
export const HisAPI = new HisConnector();