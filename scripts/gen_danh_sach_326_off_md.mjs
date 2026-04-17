/**
 * Sinh tai_lieu/Danh_sach_326_ma_OFF_theo_nhom.md và .txt từ test_xml/rule_trang_thai_audit.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'test_xml/rule_trang_thai_audit.json'), 'utf8'));
const off = [...(j.danh_sach_off || [])].sort((a, b) => {
  const fa = a.file.localeCompare(b.file);
  if (fa !== 0) return fa;
  return a.ma_luat.localeCompare(b.ma_luat, 'en', { numeric: true });
});

const NHOM = {
  'du_lieu_luat_du_lieu_muc1.jsx': {
    ten: 'Luật dữ liệu / cấu trúc XML (LUAT_DU_LIEU — muc1)',
    ly_do_nhom:
      'Các mã XML_* / CDSS_CM_* tắt trong seed để hạn chế cảnh báo khi trường dữ liệu hiếm, chuẩn chưa thống nhất, hoặc cần triển khai thêm logic/đối soát trước khi bật hàng loạt.',
  },
  'du_lieu_luat_hanh_chinh_muc2.jsx': {
    ten: 'Luật hành chính XML1 (muc2)',
    ly_do_nhom:
      'Nhiều quy tắc HC_* để OFF trong seed: chờ đủ ngữ cảnh (portal, VNeID, đa nguồn), giảm báo sai trên dữ liệu thực tế chưa chuẩn, hoặc chỉ bật khi cơ sở đã cấu hình kiểm tra tương ứng.',
  },
  'du_lieu_luat_pttt_muc11.jsx': {
    ten: 'Luật PTTT (muc11)',
    ly_do_nhom:
      'Quy tắc PTTT seed OFF khi điều kiện cần bổ sung danh mục/tham số nội bộ trước khi vận hành.',
  },
  'du_lieu_luat_thuoc_muc8.jsx': {
    ten: 'Luật thuốc (muc8)',
    ly_do_nhom:
      'Một số THUOC_* tắt trong seed do rủi ro dương tính giả (định dạng đơ, thay thế thuốc), cần rà soát từng BV hoặc chờ chuẩn hóa mã/HIS.',
  },
  'luat_cdha_hardcoded.jsx': {
    ten: 'Luật CĐHA / DVKT (CDHA_*)',
    ly_do_nhom:
      'Khối lớn CDHA_* OFF: chủ yếu liên quan MRI/CT/DSA/cản quang, XML4/XML130 chi tiết, JCI, thời gian trả KQ — thường thiếu trường hoặc dễ báo giả; giữ OFF đến khi có dữ liệu đủ và kiểm thử (có phần trùng chính sách MRI/DSA trong quy_tac_on_off_noi_bo).',
  },
  'luat_cong_kham_hardcoded.jsx': {
    ten: 'Luật công khám (CK_*)',
    ly_do_nhom:
      'Một số CK_* OFF vì cần ngữ cảnh ngoài một hồ sơ (batch nhiều lượt, map chuyên môn, COUNT_VISIT) hoặc chờ chuẩn hóa DM_KHAM/DM_* — xem comment trong luat_cong_kham_hardcoded.jsx từng mã.',
  },
  'luat_giam_dinh_chuyen_de_hardcoded.jsx': {
    ten: 'Luật giám định chuyên đề (Chuyen_de_*)',
    ly_do_nhom:
      'Các mã Chuyen_de_* OFF trong seed: điều kiện nhạy hoặc cần kiểm thử vàng / tạm khóa theo rà soát nội bộ trước khi bật lại.',
  },
  'luat_giuong_hardcoded.jsx': {
    ten: 'Luật giường (GB_*)',
    ly_do_nhom:
      'GB_* OFF khi logic giường/khoa/công suất cần khớp cấu hình BV hoặc tránh cảnh báo trên XML chưa đầy đủ.',
  },
  'luat_hop_dong_hardcoded.jsx': {
    ten: 'Luật hợp đồng / tổng hợp (HD_*)',
    ly_do_nhom:
      'HD_* OFF khi kiểm tra phụ thuộc quy ước gửi dữ liệu, ngày nghỉ, hoặc tiêu chí JCI chưa áp dụng đồng loạt.',
  },
  'luat_nhan_su_hardcoded.jsx': {
    ten: 'Luật nhân sự (NS_*)',
    ly_do_nhom:
      'NS_* OFF: phạm vi hành nghề và map nhân sự–DVKT cần danh mục đăng ký SYT/HIS đầy đủ; bật sau khi BV nạp DM nhân sự và kiểm tra khớp.',
  },
};

const mdLines = [];
const txtLines = [];

mdLines.push('# Danh sách 326 mã quy tắc seed OFF (theo nhóm file)');
mdLines.push('');
mdLines.push('Nguồn: `test_xml/rule_trang_thai_audit.json` (sinh bởi `node scripts/audit_quy_tac_trang_thai.js`).');
mdLines.push('');
mdLines.push(
  '**Ghi chú:** OFF ở đây là `TRANG_THAI: OFF` trong **mã nguồn/seed** — không bao gồm ghi đè ON/OFF trên thiết bị (`AsyncStorage` / Quản lý quy tắc).',
);
mdLines.push('');

txtLines.push('DANH SÁCH 326 MÃ QUY TẮC SEED OFF (THEO NHÓM FILE)');
txtLines.push('');
txtLines.push('Nguồn: test_xml/rule_trang_thai_audit.json (sinh bởi: node scripts/audit_quy_tac_trang_thai.js)');
txtLines.push('');
txtLines.push(
  'Ghi chú: OFF ở đây là TRANG_THAI: OFF trong mã nguồn/seed — không bao gồm ghi đè ON/OFF trên thiết bị.',
);
txtLines.push('');

const LY_DO_SEED =
  'Trong file nguồn, quy tắc được khai báo với TRANG_THAI: OFF — engine không phát cảnh báo từ mã này cho đến khi đổi seed sang ON hoặc bật qua Quản lý ON/OFF (nếu mã được quản trị).';
const GOI_Y =
  'Thường là tạm khóa vì thiếu trường XML đủ tin cậy, cần batch/hồ sơ giấy, hoặc rủi ro dương tính giả — bật khi đã rà soát với dữ liệu thật tại BV.';

let cur = null;
for (const r of off) {
  if (r.file !== cur) {
    cur = r.file;
    const meta = NHOM[cur] || {
      ten: cur,
      ly_do_nhom:
        'Quy tắc giữ OFF trong seed cho đến khi bật thủ công hoặc cập nhật mã nguồn.',
    };
    const cnt = off.filter((x) => x.file === cur).length;

    mdLines.push('---');
    mdLines.push('');
    mdLines.push(`## ${meta.ten}`);
    mdLines.push('');
    mdLines.push(`**File:** \`${cur}\`  (${cnt} mã)`);
    mdLines.push('');
    mdLines.push(`**Lý do nhóm:** ${meta.ly_do_nhom}`);
    mdLines.push('');

    txtLines.push('='.repeat(80));
    txtLines.push(meta.ten);
    txtLines.push(`File: ${cur}  (${cnt} mã)`);
    txtLines.push(`Lý do nhóm: ${meta.ly_do_nhom}`);
    txtLines.push('');
  }
  const ten = String(r.ten_quy_tac || '').replace(/\s+/g, ' ').trim();

  mdLines.push(`### ${r.ma_luat}`);
  mdLines.push('');
  mdLines.push(`- **Tên quy tắc:** ${ten || '(không có mô tả ngắn trong audit)'}`);
  mdLines.push(`- **Vì sao OFF (ở mức seed):** Trong file nguồn, quy tắc được khai báo với \`TRANG_THAI: OFF\` — engine **không** phát cảnh báo từ mã này cho đến khi đổi seed sang ON hoặc bật qua Quản lý ON/OFF (nếu mã được quản trị).`);
  mdLines.push(`- **Gợi ý nghiệp vụ:** Thường là tạm khóa vì thiếu trường XML đủ tin cậy, cần batch/hồ sơ giấy, hoặc rủi ro dương tính giả — bật khi đã rà soát với dữ liệu thật tại BV.`);
  mdLines.push('');

  txtLines.push('-'.repeat(80));
  txtLines.push(`MÃ LUẬT: ${r.ma_luat}`);
  txtLines.push(`Tên quy tắc: ${ten || '(không có mô tả ngắn trong audit)'}`);
  txtLines.push(`Vì sao OFF (seed): ${LY_DO_SEED}`);
  txtLines.push(`Gợi ý nghiệp vụ: ${GOI_Y}`);
  txtLines.push('');
}

const mdPath = path.join(ROOT, 'tai_lieu', 'Danh_sach_326_ma_OFF_theo_nhom.md');
const txtPath = path.join(ROOT, 'tai_lieu', 'Danh_sach_326_ma_OFF_theo_nhom.txt');

fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
fs.writeFileSync(txtPath, txtLines.join('\n'), 'utf8');

console.log('Wrote', mdPath);
console.log('Wrote', txtPath, 'bytes=', Buffer.byteLength(txtLines.join('\n'), 'utf8'));
