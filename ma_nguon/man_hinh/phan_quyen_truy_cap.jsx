import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    capNhatMatKhauTrongDanhSach,
    KIEM_TRA_EMAIL_CDSS,
    kiemTraDinhDangMatKhau,
    taoBanGhiTaiKhoanMoi,
    taoMatKhauNgauNhien,
} from '../tien_ich/dich_vu_tai_khoan_cdss';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { capNhatTaiKhoanTheoEmail, docDanhSachTaiKhoan, ghiNhatKyHeThong, layNhatKyHeThong, luuDanhSachTaiKhoan, themTaiKhoanMoi } from '../tien_ich/nhat_ky_he_thong';
import { docPhienDangNhap } from '../tien_ich/phien_dang_nhap';
import { laMoiTruongWeb } from '../tien_ich/luu_tru_he_thong';
import {
    docPhieuBanTuFileWeb,
    phucHoiPhieuBanTaiKhoanRbac,
    xuatPhieuBanTaiKhoanRbacWeb,
} from '../tien_ich/sao_luu_tai_khoan_rbac';
import {
    damBaoMigratePhanQuyen,
    dongBoLegacyAclTheoRBAC,
    kiemTraQuyen,
    luuRBAC,
    nguoiDungLaAdminRbac,
    RBAC_ACTIONS,
    taiRBAC,
    taoPermissionKey,
    xoaLegacyAclTheoEmail,
} from '../tien_ich/rbac_engine';

const DATA_SCOPES = ['SELF', 'GROUP', 'ALL'];
const ACCOUNT_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'];
const CREATE_ACCOUNT_TABS = [
  { id: 'PROFILE', label: 'Thông tin tài khoản' },
  { id: 'PERMISSIONS', label: 'Phân quyền ngay' },
];

const tachDanhSachDuyNhat = (items) => Array.from(new Set((Array.isArray(items) ? items : []).filter(Boolean)));

const laBindingAdmin = (binding) => (binding?.roleIds || []).includes('ROLE_ADMIN');

const taoBindingRong = () => ({
  roleIds: [],
  groupIds: [],
  overrides: { allow: [], deny: [] },
  dataScope: 'SELF',
});

const taoBindingTheoTaiKhoan = (binding = {}) => {
  const roleIds = tachDanhSachDuyNhat((binding?.roleIds || []).map((item) => String(item || '').trim()));
  const groupIds = tachDanhSachDuyNhat((binding?.groupIds || []).map((item) => String(item || '').trim()));
  const allow = tachDanhSachDuyNhat((binding?.overrides?.allow || []).map((item) => String(item || '').trim()));
  const deny = tachDanhSachDuyNhat((binding?.overrides?.deny || []).map((item) => String(item || '').trim()))
    .filter((item) => !allow.includes(item));
  const isAdmin = roleIds.includes('ROLE_ADMIN');
  return {
    roleIds: isAdmin ? ['ROLE_ADMIN'] : roleIds,
    groupIds,
    overrides: isAdmin ? { allow: [], deny: [] } : { allow, deny },
    dataScope: isAdmin
      ? 'ALL'
      : (DATA_SCOPES.includes(String(binding?.dataScope || '').toUpperCase()) ? String(binding.dataScope).toUpperCase() : null),
  };
};

const taoBindingMacDinh = (user) => {
  if (String(user?.vaiTro || '').toUpperCase() === 'ADMIN') {
    return taoBindingTheoTaiKhoan({
      roleIds: ['ROLE_ADMIN'],
      groupIds: [],
      overrides: { allow: [], deny: [] },
      dataScope: 'ALL',
    });
  }
  return taoBindingTheoTaiKhoan(taoBindingRong());
};

const trangThaiRole = (cfg, roleId) => (cfg.roles.find((r) => r.id === roleId)?.name || roleId);
const trangThaiGroup = (cfg, groupId) => (cfg.groups.find((g) => g.id === groupId)?.name || groupId);
const voiTimeout = (promise, timeoutMs, message) => Promise.race([
  promise,
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), timeoutMs);
  }),
]);

export default function ManHinhPhanQuyen({ navigation }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [cfg, setCfg] = useState({ resources: [], roles: [], groups: [], matrix: {}, userBindings: {} });
  const [tab, setTab] = useState('USERS');

  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const [auditRows, setAuditRows] = useState([]);
  const [locEmailNhatKy, setLocEmailNhatKy] = useState('');
  const [tuKhoaNhatKy, setTuKhoaNhatKy] = useState('');

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserEmail, setEditingUserEmail] = useState('');
  const [createUserTab, setCreateUserTab] = useState('PROFILE');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newUserRoleIds, setNewUserRoleIds] = useState([]);
  const [newUserGroupIds, setNewUserGroupIds] = useState([]);
  const [newUserDataScope, setNewUserDataScope] = useState('SELF');
  const [newUserOverrides, setNewUserOverrides] = useState({ allow: [], deny: [] });
  const [dangTaoTaiKhoan, setDangTaoTaiKhoan] = useState(false);
  const [dangLuuHoSoTaiKhoan, setDangLuuHoSoTaiKhoan] = useState(false);
  const [thongBaoTaoTaiKhoan, setThongBaoTaoTaiKhoan] = useState('');
  const [capDoThongBaoTaoTaiKhoan, setCapDoThongBaoTaoTaiKhoan] = useState('INFO');

  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleScope, setNewRoleScope] = useState('SELF');

  const [newGroupId, setNewGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const [newResId, setNewResId] = useState('');
  const [newResName, setNewResName] = useState('');
  const [newResModuleId, setNewResModuleId] = useState('');
  const [newResRoute, setNewResRoute] = useState('');
  const [tuKhoaNguoiDung, setTuKhoaNguoiDung] = useState('');
  /** Tách màn: tài khoản/mật khẩu vs gán RBAC theo user */
  const [usersSubTab, setUsersSubTab] = useState('TAI_KHOAN');
  const [modalMatKhau, setModalMatKhau] = useState(null);
  const [mkAdminMoi, setMkAdminMoi] = useState('');
  const [mkAdminXacNhan, setMkAdminXacNhan] = useState('');
  const [buocDoiSauDoiAdmin, setBuocDoiSauDoiAdmin] = useState(true);
  const [dangLuuMatKhauAdmin, setDangLuuMatKhauAdmin] = useState(false);
  const [dangXuatBackupTaiKhoan, setDangXuatBackupTaiKhoan] = useState(false);
  const [dangPhucHoiBackupTaiKhoan, setDangPhucHoiBackupTaiKhoan] = useState(false);

  const selectedUser = useMemo(
    () => users.find((u) => u.email === selectedUserEmail) || null,
    [users, selectedUserEmail]
  );

  const editingUser = useMemo(
    () => users.find((u) => u.email === editingUserEmail) || null,
    [users, editingUserEmail]
  );

  const selectedBinding = useMemo(() => {
    if (!selectedUser) return null;
    return taoBindingTheoTaiKhoan(cfg.userBindings[selectedUser.email] || taoBindingMacDinh(selectedUser));
  }, [cfg.userBindings, selectedUser]);

  const bindingNguoiDungMoi = useMemo(() => taoBindingTheoTaiKhoan({
    roleIds: newUserRoleIds,
    groupIds: newUserGroupIds,
    overrides: newUserOverrides,
    dataScope: newUserDataScope,
  }), [newUserDataScope, newUserGroupIds, newUserOverrides, newUserRoleIds]);

  const dsNguoiDungDaLoc = useMemo(() => {
    const tuKhoa = String(tuKhoaNguoiDung || '').trim().toLowerCase();
    if (!tuKhoa) return users;
    return users.filter((u) => {
      const chuoi = `${u.email || ''} ${u.hoTen || u.ten || ''} ${u.khoa || ''} ${u.phong || ''} ${u.chucDanh || ''} ${u.soDienThoai || ''} ${u.vaiTro || ''} ${u.trangThai || ''}`.toLowerCase();
      return chuoi.includes(tuKhoa);
    });
  }, [users, tuKhoaNguoiDung]);

  const thongKeNhanh = useMemo(() => {
    const tongNguoiDung = users.length;
    const tongDangHoatDong = users.filter((u) => u.trangThai !== 'KHOA').length;
    const tongBiKhoa = users.filter((u) => u.trangThai === 'KHOA').length;
    const tongAdmin = users.filter((u) => nguoiDungLaAdminRbac({
      cfg,
      email: u.email,
      fallbackRole: u.vaiTro || 'USER',
    })).length;
    return { tongNguoiDung, tongDangHoatDong, tongBiKhoa, tongAdmin };
  }, [cfg, users]);

  const laAdminHieuLuc = (email, cfgTarget = cfg, usersTarget = users) => {
    const user = (usersTarget || []).find((item) => item.email === email);
    return nguoiDungLaAdminRbac({
      cfg: cfgTarget,
      email,
      fallbackRole: user?.vaiTro || 'USER',
    });
  };

  const demAdminDangHoatDong = (cfgTarget = cfg, usersTarget = users) =>
    (usersTarget || []).filter((item) => item.trangThai !== 'KHOA' && laAdminHieuLuc(item.email, cfgTarget, usersTarget)).length;

  const laAdminCuoiDangHoatDong = (email, cfgTarget = cfg, usersTarget = users) => {
    const user = (usersTarget || []).find((item) => item.email === email);
    if (!user || user.trangThai === 'KHOA') return false;
    if (!laAdminHieuLuc(email, cfgTarget, usersTarget)) return false;
    return demAdminDangHoatDong(cfgTarget, usersTarget) === 1;
  };

  const taoBindingKhoiTaoChoTaiKhoanMoi = () => taoBindingTheoTaiKhoan(taoBindingRong());

  const capNhatDraftTaoTaiKhoan = (binding) => {
    const bindingChuan = taoBindingTheoTaiKhoan(binding);
    setNewUserRoleIds(bindingChuan.roleIds);
    setNewUserGroupIds(bindingChuan.groupIds);
    setNewUserOverrides(bindingChuan.overrides);
    setNewUserDataScope(bindingChuan.dataScope || 'SELF');
  };

  const moModalTaoTaiKhoan = () => {
    resetCreateUserForm();
    capNhatDraftTaoTaiKhoan(taoBindingKhoiTaoChoTaiKhoanMoi());
    setCreateUserTab('PROFILE');
    setShowCreateUser(true);
  };

  const batTatRoleChoNguoiDungMoi = (roleId) => {
    const roleIds = bindingNguoiDungMoi.roleIds.includes(roleId)
      ? bindingNguoiDungMoi.roleIds.filter((item) => item !== roleId)
      : [...bindingNguoiDungMoi.roleIds, roleId];
    capNhatDraftTaoTaiKhoan({
      ...bindingNguoiDungMoi,
      roleIds,
    });
  };

  const batTatGroupChoNguoiDungMoi = (groupId) => {
    const groupIds = bindingNguoiDungMoi.groupIds.includes(groupId)
      ? bindingNguoiDungMoi.groupIds.filter((item) => item !== groupId)
      : [...bindingNguoiDungMoi.groupIds, groupId];
    capNhatDraftTaoTaiKhoan({
      ...bindingNguoiDungMoi,
      groupIds,
    });
  };

  const batTatOverrideChoNguoiDungMoi = (resourceId, action, mode) => {
    if (laBindingAdmin(bindingNguoiDungMoi)) return;
    const key = taoPermissionKey(resourceId, action);
    const allow = new Set(bindingNguoiDungMoi.overrides.allow || []);
    const deny = new Set(bindingNguoiDungMoi.overrides.deny || []);
    if (mode === 'ALLOW') {
      if (allow.has(key)) allow.delete(key);
      else {
        allow.add(key);
        deny.delete(key);
      }
    } else if (deny.has(key)) deny.delete(key);
    else {
      deny.add(key);
      allow.delete(key);
    }
    capNhatDraftTaoTaiKhoan({
      ...bindingNguoiDungMoi,
      overrides: { allow: Array.from(allow), deny: Array.from(deny) },
    });
  };

  const capAdminToanQuyenChoUser = async (email) => {
    await capNhatBinding(email, () => taoBindingTheoTaiKhoan({
      roleIds: ['ROLE_ADMIN'],
      groupIds: [],
      overrides: { allow: [], deny: [] },
      dataScope: 'ALL',
    }), 'Cấp ROLE_ADMIN toàn quyền');
  };

  const boAdminToanQuyenChoUser = async (email) => {
    await capNhatBinding(email, (oldBinding) => {
      const roleIds = (oldBinding?.roleIds || []).filter((roleId) => roleId !== 'ROLE_ADMIN');
      return {
        ...oldBinding,
        roleIds,
        dataScope: roleIds.length > 0 ? oldBinding?.dataScope : 'SELF',
      };
    }, 'Gỡ ROLE_ADMIN để bật phân quyền chi tiết');
  };

  const boAdminToanQuyenChoNguoiDungMoi = () => {
    capNhatDraftTaoTaiKhoan({
      roleIds: [],
      groupIds: [],
      overrides: { allow: [], deny: [] },
      dataScope: 'SELF',
    });
  };

  const damBaoBindingTheoTaiKhoan = async (dsNguoiDung, cauHinh) => {
    const nextBindings = { ...(cauHinh?.userBindings || {}) };
    let coThayDoi = false;
    (dsNguoiDung || []).forEach((user) => {
      const email = String(user?.email || '').trim().toLowerCase();
      if (!email) return;
      const bindingCu = nextBindings[email];
      const bindingMoi = taoBindingTheoTaiKhoan(bindingCu || taoBindingMacDinh(user));
      if (JSON.stringify(bindingCu || null) !== JSON.stringify(bindingMoi)) {
        nextBindings[email] = bindingMoi;
        coThayDoi = true;
      }
    });
    if (!coThayDoi) return cauHinh;
    const saved = await luuRBAC({ ...cauHinh, userBindings: nextBindings });
    await ghiNhatKyHeThong({
      hanhDong: 'CHUAN_HOA_BINDING_TAI_KHOAN',
      doiTuong: 'RBAC',
      chiTiet: 'Chuẩn hóa binding phân quyền theo từng tài khoản.',
      taiKhoan: adminEmail,
      vaiTro: 'ADMIN',
    });
    return saved;
  };

  const resetCreateUserForm = () => {
    const bindingMacDinh = taoBindingKhoiTaoChoTaiKhoanMoi();
    setDangTaoTaiKhoan(false);
    setThongBaoTaoTaiKhoan('');
    setCapDoThongBaoTaoTaiKhoan('INFO');
    setNewEmail('');
    setNewName('');
    setNewDepartment('');
    setNewRoom('');
    setNewTitle('');
    setNewPhone('');
    setNewPass('');
    setCreateUserTab('PROFILE');
    setNewUserRoleIds(bindingMacDinh.roleIds);
    setNewUserGroupIds(bindingMacDinh.groupIds);
    setNewUserOverrides(bindingMacDinh.overrides);
    setNewUserDataScope(bindingMacDinh.dataScope || 'SELF');
  };

  const dongModalTaoTaiKhoan = () => {
    setShowCreateUser(false);
    resetCreateUserForm();
  };

  useEffect(() => {
    if (!dangTaoTaiKhoan) return undefined;
    const timer = setTimeout(() => {
      setDangTaoTaiKhoan(false);
      setCapDoThongBaoTaoTaiKhoan('ERROR');
      setThongBaoTaoTaiKhoan('Tạo tài khoản đang bị treo quá lâu. Vui lòng bấm tạo lại hoặc tải lại màn hình.');
    }, 60000);
    return () => clearTimeout(timer);
  }, [dangTaoTaiKhoan]);

  const bamTaoTaiKhoan = () => {
    if (dangTaoTaiKhoan) {
      setCapDoThongBaoTaoTaiKhoan('INFO');
      setThongBaoTaoTaiKhoan('Hệ thống đang xử lý tạo tài khoản, vui lòng chờ...');
      return;
    }
    setCapDoThongBaoTaoTaiKhoan('INFO');
    setThongBaoTaoTaiKhoan('Đang gửi yêu cầu tạo tài khoản...');
    taoTaiKhoan();
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    khoiTao();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const xuatBackupTaiKhoanRbac = async () => {
    if (dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan) return;
    if (!laMoiTruongWeb()) {
      Alert.alert('Sao lưu', 'Xuất file JSON chỉ hỗ trợ trên trình duyệt web.');
      return;
    }
    setDangXuatBackupTaiKhoan(true);
    try {
      const ketQua = await xuatPhieuBanTaiKhoanRbacWeb({ reason: 'PHAN_QUYEN_EXPORT' });
      if (!ketQua?.ok) {
        Alert.alert('Sao lưu', ketQua?.message || 'Không thể xuất file sao lưu.');
        return;
      }
      Alert.alert(
        'Sao lưu thành công',
        `Đã xuất ${ketQua.account_count || 0} tài khoản + cấu hình RBAC ra file ${ketQua.fileName}.`
      );
    } catch (e) {
      Alert.alert('Sao lưu', e?.message || 'Không thể xuất file sao lưu.');
    } finally {
      setDangXuatBackupTaiKhoan(false);
    }
  };

  const xuLyPhucHoiBackupTaiKhoanRbac = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    event.target.value = null;
    if (dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan) return;

    Alert.alert(
      'Phục hồi sao lưu',
      'File sẽ ghi đè danh sách tài khoản và cấu hình phân quyền hiện tại. Tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phục hồi',
          style: 'destructive',
          onPress: async () => {
            setDangPhucHoiBackupTaiKhoan(true);
            try {
              const payload = await docPhieuBanTuFileWeb(file);
              const ketQua = await phucHoiPhieuBanTaiKhoanRbac(payload, {
                nguoiThucHien: adminEmail || 'ADMIN',
                ghiDe: true,
              });
              if (!ketQua?.ok) {
                Alert.alert('Phục hồi', ketQua?.message || 'Không thể phục hồi từ file.');
                return;
              }
              await khoiTao();
              Alert.alert('Phục hồi thành công', ketQua.message || 'Đã phục hồi tài khoản và phân quyền.');
            } catch (e) {
              Alert.alert('Phục hồi', e?.message || 'Không thể phục hồi từ file.');
            } finally {
              setDangPhucHoiBackupTaiKhoan(false);
            }
          },
        },
      ]
    );
  };

  const khoiTao = async () => {
    try {
      await damBaoMigratePhanQuyen();
      const session = await docPhienDangNhap();
      const role = session.role;
      const account = session.email;
      const email = String(account || '').toLowerCase();

      setAdminEmail(email);

      const [dsNguoiDung, cauHinhRaw] = await Promise.all([docDanhSachTaiKhoan(), taiRBAC()]);
      const cauHinh = await damBaoBindingTheoTaiKhoan(dsNguoiDung, cauHinhRaw);
      if (!nguoiDungLaAdminRbac({ cfg: cauHinh, email, fallbackRole: role })) {
        Alert.alert('Từ chối', 'Tài khoản hiện tại chưa được cấp quyền quản trị phân quyền.');
        quayLaiAnToan(navigation, 'TongQuan');
        return;
      }

      setUsers(dsNguoiDung);
      setCfg(cauHinh);
      const roleMacDinhChoMaTran = cauHinh.roles.find((r) => r.id !== 'ROLE_ADMIN')?.id || cauHinh.roles[0]?.id || '';
      setSelectedRoleId(roleMacDinhChoMaTran);

      await napNhatKy('', '');
      await tuDongDongBoLegacy(dsNguoiDung, cauHinh);
    } catch (_e) {
      Alert.alert('Lỗi', 'Không thể khởi tạo module phân quyền.');
    }
  };

  const tuDongDongBoLegacy = async (dsNguoiDung, cauHinh) => {
    const tasks = (dsNguoiDung || []).map((u) => dongBoLegacyAclTheoRBAC({ cfg: cauHinh, email: u.email, fallbackRole: u?.vaiTro || 'USER' }));
    await Promise.all(tasks);
  };

  const napNhatKy = async (emailFilter = locEmailNhatKy, tuKhoa = tuKhoaNhatKy) => {
    const rows = await layNhatKyHeThong({ taiKhoan: emailFilter, tuKhoa, gioiHan: 250 });
    setAuditRows(rows);
  };

  const luuCauHinh = async (nextCfg, hanhDong, doiTuong, chiTiet, dsNguoiDungDongBo = users) => {
    const saved = await luuRBAC(nextCfg);
    setCfg(saved);
    await tuDongDongBoLegacy(dsNguoiDungDongBo, saved);
    await ghiNhatKyHeThong({
      hanhDong,
      doiTuong,
      chiTiet,
      taiKhoan: adminEmail,
      vaiTro: 'ADMIN',
    });
    await napNhatKy();
    return saved;
  };

  const taoTaiKhoan = async () => {
    if (dangTaoTaiKhoan) return;
    setDangTaoTaiKhoan(true);
    setThongBaoTaoTaiKhoan('');
    setCapDoThongBaoTaoTaiKhoan('INFO');
    try {
      const email = newEmail.trim().toLowerCase();
      const hoTen = newName.trim();
      const khoa = newDepartment.trim();
      const phong = newRoom.trim();
      const chucDanh = newTitle.trim();
      const soDienThoai = newPhone.trim();
      const soDienThoaiDigits = soDienThoai.replace(/\D/g, '');
      const matKhau = newPass.trim();
      if (!email || !hoTen || !matKhau) {
        setCapDoThongBaoTaoTaiKhoan('ERROR');
        setThongBaoTaoTaiKhoan('Thiếu thông tin bắt buộc: họ tên, email hoặc mật khẩu.');
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập tối thiểu họ tên, email và mật khẩu khởi tạo.');
        return;
      }
      if (!KIEM_TRA_EMAIL_CDSS.test(email)) {
        setCapDoThongBaoTaoTaiKhoan('ERROR');
        setThongBaoTaoTaiKhoan('Email chưa đúng định dạng.');
        Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập đúng định dạng email (ví dụ: ten@benhvien.vn).');
        return;
      }
      if (soDienThoai && (soDienThoaiDigits.length < 6 || soDienThoaiDigits.length > 15)) {
        setCapDoThongBaoTaoTaiKhoan('ERROR');
        setThongBaoTaoTaiKhoan('Số điện thoại phải có từ 6 đến 15 chữ số hoặc để trống.');
        Alert.alert('Số điện thoại chưa hợp lệ', 'Vui lòng nhập số điện thoại liên lạc từ 6 đến 15 chữ số.');
        return;
      }
      if (matKhau.length < 6) {
        setCapDoThongBaoTaoTaiKhoan('ERROR');
        setThongBaoTaoTaiKhoan('Mật khẩu khởi tạo phải từ 6 ký tự trở lên.');
        Alert.alert('Lỗi bảo mật', 'Mật khẩu khởi tạo phải từ 6 ký tự trở lên.');
        return;
      }

      if (bindingNguoiDungMoi.roleIds.length === 0 && bindingNguoiDungMoi.overrides.allow.length === 0) {
        setCapDoThongBaoTaoTaiKhoan('INFO');
        setThongBaoTaoTaiKhoan('Tài khoản sẽ được tạo ở trạng thái chưa gán quyền. Bạn có thể on/off quyền ngay sau khi tạo.');
        Alert.alert(
          'Tạo tài khoản chưa gán quyền',
          'Tài khoản sẽ được tạo nhưng chưa có quyền truy cập. Bạn có thể gán quyền ngay sau khi tạo trong mục Phân quyền theo tài khoản.'
        );
      }

      const cfgHienTai = await voiTimeout(
        taiRBAC(),
        15000,
        'Hết thời gian tải dữ liệu hệ thống khi tạo tài khoản. Vui lòng thử lại.'
      );

      const bindingKhoiTao = taoBindingTheoTaiKhoan(bindingNguoiDungMoi);
      const laAdminToanQuyen = laBindingAdmin(bindingKhoiTao);
      const danhSachRole = bindingKhoiTao.roleIds.map((id) => trangThaiRole(cfgHienTai, id)).join(', ') || 'Không gán role';
      const danhSachGroup = bindingKhoiTao.groupIds.map((id) => trangThaiGroup(cfgHienTai, id)).join(', ') || 'Không gán nhóm';

      const banGhiMoi = taoBanGhiTaiKhoanMoi({
        email,
        hoTen,
        khoa,
        phong,
        chucDanh,
        soDienThoai,
        matKhau,
        vaiTro: laAdminToanQuyen ? 'ADMIN' : 'USER',
        trangThai: 'HOAT_DONG',
        buocDoiMatKhau: false,
      });
      const nextUsers = await voiTimeout(
        themTaiKhoanMoi(banGhiMoi, adminEmail || 'ADMIN'),
        20000,
        'Hết thời gian lưu danh sách tài khoản. Vui lòng kiểm tra storage và thử lại.'
      );

      const nextCfg = {
        ...cfgHienTai,
        userBindings: {
          ...cfgHienTai.userBindings,
          [email]: bindingKhoiTao,
        },
      };

      if (!nextUsers.some((u) => u.email === email)) {
        throw new Error(`Không thể xác nhận tài khoản ${email} sau khi lưu.`);
      }

      let canhBaoSauTao = '';
      try {
        await voiTimeout(
          luuCauHinh(
            nextCfg,
            'TAO_TAI_KHOAN_RBAC',
            email,
            `Tạo tài khoản ${hoTen} | ${chucDanh || 'Chưa cập nhật chức danh'} | ${(khoa || 'Chưa cập nhật khoa')}/${(phong || 'Chưa cập nhật phòng')} | vai trò: ${danhSachRole} | nhóm: ${danhSachGroup}${laAdminToanQuyen ? ' | admin toàn quyền' : ''}`,
            nextUsers
          ),
          15000,
          'Hết thời gian đồng bộ RBAC sau khi tạo tài khoản.'
        );
      } catch (eRbac) {
        canhBaoSauTao = 'Tài khoản đã được tạo nhưng đồng bộ phân quyền chưa hoàn tất. Vui lòng mở lại màn hình hoặc gán quyền thủ công cho tài khoản vừa tạo.';
        await ghiNhatKyHeThong({
          hanhDong: 'CANH_BAO_TAO_TAI_KHOAN_RBAC',
          doiTuong: email,
          chiTiet: String(eRbac?.message || 'Lỗi đồng bộ RBAC sau tạo tài khoản.'),
          taiKhoan: adminEmail,
          vaiTro: 'ADMIN',
        });
      }

      const [usersDaLuu, cfgDaLuu] = await Promise.all([docDanhSachTaiKhoan(), taiRBAC()]);
      setUsers(usersDaLuu);
      setCfg(cfgDaLuu);
      setSelectedUserEmail(email);
      setUsersSubTab('RBAC');
      setCapDoThongBaoTaoTaiKhoan('SUCCESS');
      setThongBaoTaoTaiKhoan(`Đã lưu tài khoản ${email} thành công.`);
      dongModalTaoTaiKhoan();
      if (canhBaoSauTao) {
        Alert.alert('Tạo tài khoản thành công', `Đã tạo tài khoản ${email}.\n\n${canhBaoSauTao}`);
      } else {
        Alert.alert('Thành công', `Đã tạo tài khoản ${email}.`);
      }
    } catch (e) {
      const thongDiep = String(e?.message || '').trim() || 'Không thể tạo tài khoản. Vui lòng thử lại.';
      setCapDoThongBaoTaoTaiKhoan('ERROR');
      setThongBaoTaoTaiKhoan(thongDiep);
      Alert.alert('Lỗi tạo tài khoản', thongDiep);
    } finally {
      setDangTaoTaiKhoan(false);
    }
  };

  const moModalSuaTaiKhoan = (user) => {
    setEditingUserEmail(user.email);
    setNewName(user.hoTen || user.ten || '');
    setNewDepartment(user.khoa || '');
    setNewRoom(user.phong || '');
    setNewTitle(user.chucDanh || '');
    setNewPhone(user.soDienThoai || '');
    setShowEditUser(true);
  };

  const luuHoSoTaiKhoan = async () => {
    if (!editingUser || dangLuuHoSoTaiKhoan) return;
    setDangLuuHoSoTaiKhoan(true);
    try {
      const hoTen = newName.trim();
      const khoa = newDepartment.trim();
      const phong = newRoom.trim();
      const chucDanh = newTitle.trim();
      const soDienThoai = newPhone.trim();
      const soDienThoaiDigits = soDienThoai.replace(/\D/g, '');

      if (!hoTen) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
        return;
      }
      if (soDienThoai && (soDienThoaiDigits.length < 6 || soDienThoaiDigits.length > 15)) {
        Alert.alert('Số điện thoại chưa hợp lệ', 'Vui lòng nhập số điện thoại liên lạc từ 6 đến 15 chữ số.');
        return;
      }

      const { ok, danhSach: nextUsers } = await capNhatTaiKhoanTheoEmail(
        editingUser.email,
        { ten: hoTen, hoTen, khoa, phong, chucDanh, soDienThoai },
        adminEmail || 'ADMIN',
      );
      if (!ok) {
        throw new Error('Không tìm thấy tài khoản cần cập nhật.');
      }

      setUsers(nextUsers);
      setShowEditUser(false);
      setEditingUserEmail('');
      setNewName('');
      setNewDepartment('');
      setNewRoom('');
      setNewTitle('');
      setNewPhone('');
      await ghiNhatKyHeThong({
        hanhDong: 'CAP_NHAT_HO_SO_TAI_KHOAN',
        doiTuong: editingUser.email,
        chiTiet: `Cập nhật hồ sơ ${hoTen} | ${chucDanh} | ${khoa}/${phong}`,
        taiKhoan: adminEmail,
        vaiTro: 'ADMIN',
      });
      await napNhatKy();
      Alert.alert('Thành công', `Đã cập nhật hồ sơ ${editingUser.email}.`);
    } catch (e) {
      Alert.alert('Lỗi cập nhật', String(e?.message || 'Không thể cập nhật hồ sơ tài khoản.'));
    } finally {
      setDangLuuHoSoTaiKhoan(false);
    }
  };

  const doiTrangThaiTaiKhoan = (user) => {
    const locked = user?.trangThai === 'KHOA';
    const trangThaiMoi = locked ? 'HOAT_DONG' : 'KHOA';
    if (!locked && laAdminCuoiDangHoatDong(user.email)) {
      Alert.alert('Không thể khóa', 'Đây là tài khoản quản trị đang hoạt động cuối cùng của hệ thống.');
      return;
    }
    Alert.alert('Xác nhận', `Bạn có chắc muốn ${locked ? 'mở khóa' : 'khóa'} ${user.email}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          const nextUsers = await luuDanhSachTaiKhoan(
            users.map((u) => (u.email === user.email ? { ...u, trangThai: trangThaiMoi } : u)),
            adminEmail || 'ADMIN'
          );
          setUsers(nextUsers);
          await tuDongDongBoLegacy(nextUsers, cfg);
          await ghiNhatKyHeThong({
            hanhDong: 'CAP_NHAT_TRANG_THAI_TAI_KHOAN',
            doiTuong: user.email,
            chiTiet: `Trạng thái mới: ${trangThaiMoi}`,
            taiKhoan: adminEmail,
            vaiTro: 'ADMIN',
          });
          await napNhatKy();
        },
      },
    ]);
  };

  const moModalMatKhauAdmin = (user) => {
    setModalMatKhau({ email: user.email, hoTen: user.hoTen || user.ten || user.email });
    setMkAdminMoi('');
    setMkAdminXacNhan('');
    setBuocDoiSauDoiAdmin(true);
  };

  const dongModalMatKhauAdmin = () => {
    setModalMatKhau(null);
    setMkAdminMoi('');
    setMkAdminXacNhan('');
    setDangLuuMatKhauAdmin(false);
  };

  const sinhMatKhauTamVaLuu = (user) => {
    const mk = taoMatKhauNgauNhien(12);
    Alert.alert(
      'Cấp mật khẩu tạm (phục hồi)',
      `Gửi cho người dùng một lần (không gửi email tự động trong phiên bản này):\n\n${mk}\n\nSau khi lưu, người dùng phải đổi mật khẩu khi đăng nhập lại.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Lưu & áp dụng',
          onPress: async () => {
            const nextUsers = await luuDanhSachTaiKhoan(
              capNhatMatKhauTrongDanhSach(users, user.email, mk, { buocDoiMatKhau: true }),
              adminEmail || 'ADMIN',
            );
            setUsers(nextUsers);
            await ghiNhatKyHeThong({
              hanhDong: 'PHUC_HOI_MAT_KHAU_TEMP',
              doiTuong: user.email,
              chiTiet: 'Admin cấp mật khẩu tạm + bắt buộc đổi khi đăng nhập',
              taiKhoan: adminEmail,
              vaiTro: 'ADMIN',
            });
            await napNhatKy();
          },
        },
      ],
    );
  };

  const luuMatKhauAdminTuModal = async () => {
    if (!modalMatKhau?.email || dangLuuMatKhauAdmin) return;
    const email = modalMatKhau.email;
    const mk = mkAdminMoi.trim();
    const mk2 = mkAdminXacNhan.trim();
    const kt = kiemTraDinhDangMatKhau(mk);
    if (!kt.ok) {
      Alert.alert('Mật khẩu', kt.loi);
      return;
    }
    if (mk !== mk2) {
      Alert.alert('Xác nhận', 'Hai lần nhập mật khẩu mới không khớp.');
      return;
    }
    setDangLuuMatKhauAdmin(true);
    try {
      const nextUsers = await luuDanhSachTaiKhoan(
        capNhatMatKhauTrongDanhSach(users, email, mk, { buocDoiMatKhau: buocDoiSauDoiAdmin }),
        adminEmail || 'ADMIN',
      );
      setUsers(nextUsers);
      await ghiNhatKyHeThong({
        hanhDong: 'ADMIN_DOI_MAT_KHAU',
        doiTuong: email,
        chiTiet: buocDoiSauDoiAdmin ? 'Admin đặt mật khẩu + bắt đổi khi đăng nhập' : 'Admin đặt mật khẩu',
        taiKhoan: adminEmail,
        vaiTro: 'ADMIN',
      });
      await napNhatKy();
      dongModalMatKhauAdmin();
      Alert.alert('Thành công', `Đã cập nhật mật khẩu cho ${email}.`);
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || 'Không lưu được.'));
    } finally {
      setDangLuuMatKhauAdmin(false);
    }
  };

  const xoaTaiKhoan = (user) => {
    if (laAdminCuoiDangHoatDong(user.email)) {
      Alert.alert('Không thể xóa', 'Đây là tài khoản quản trị đang hoạt động cuối cùng của hệ thống.');
      return;
    }
    Alert.alert('Cảnh báo', `Xóa tài khoản ${user.email}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const nextUsers = await luuDanhSachTaiKhoan(users.filter((u) => u.email !== user.email), adminEmail || 'ADMIN');
          const nextBindings = { ...cfg.userBindings };
          delete nextBindings[user.email];
          await xoaLegacyAclTheoEmail(user.email);
          await luuCauHinh(
            { ...cfg, userBindings: nextBindings },
            'XOA_TAI_KHOAN_RBAC',
            user.email,
            'Xóa tài khoản và binding quyền',
            nextUsers
          );
          setUsers(nextUsers);
          if (selectedUserEmail === user.email) setSelectedUserEmail('');
        },
      },
    ]);
  };

  const capNhatBinding = async (email, updater, moTaLog) => {
    try {
      const oldBinding = taoBindingTheoTaiKhoan(cfg.userBindings[email] || taoBindingMacDinh({ email, vaiTro: users.find((u) => u.email === email)?.vaiTro }));
      const newBinding = taoBindingTheoTaiKhoan(updater(oldBinding));
      const vaiTroMoi = laBindingAdmin(newBinding) ? 'ADMIN' : 'USER';
      let dsNguoiDungDongBo = users;
      if (users.some((item) => item.email === email && item.vaiTro !== vaiTroMoi)) {
        dsNguoiDungDongBo = await luuDanhSachTaiKhoan(
          users.map((item) => (item.email === email ? { ...item, vaiTro: vaiTroMoi } : item)),
          adminEmail || 'ADMIN'
        );
        setUsers(dsNguoiDungDongBo);
      }
      const nextCfg = {
        ...cfg,
        userBindings: {
          ...cfg.userBindings,
          [email]: newBinding,
        },
      };
      await luuCauHinh(nextCfg, 'CAP_NHAT_BINDING_USER', email, moTaLog, dsNguoiDungDongBo);
    } catch (e) {
      Alert.alert('Lỗi cập nhật phân quyền', String(e?.message || 'Không thể cập nhật binding. Vui lòng thử lại.'));
    }
  };

  const batTatRoleChoUser = async (email, roleId) => {
    const oldBinding = taoBindingTheoTaiKhoan(cfg.userBindings[email] || taoBindingMacDinh({ email, vaiTro: users.find((u) => u.email === email)?.vaiTro }));
    const exists = oldBinding.roleIds.includes(roleId);
    const roleIds = exists ? oldBinding.roleIds.filter((x) => x !== roleId) : [...oldBinding.roleIds, roleId];
    const bindingDuKien = taoBindingTheoTaiKhoan({ ...oldBinding, roleIds });
    const nextCfg = {
      ...cfg,
      userBindings: {
        ...cfg.userBindings,
        [email]: bindingDuKien,
      },
    };

    if (exists && laAdminCuoiDangHoatDong(email, cfg, users) && demAdminDangHoatDong(nextCfg, users) === 0) {
      Alert.alert('Không thể gỡ quyền', 'Không thể xóa ROLE_ADMIN khỏi tài khoản quản trị cuối cùng đang hoạt động.');
      return;
    }

    await capNhatBinding(email, (oldBinding) => {
      const exists = oldBinding.roleIds.includes(roleId);
      const roleIds = exists ? oldBinding.roleIds.filter((x) => x !== roleId) : [...oldBinding.roleIds, roleId];
      return { ...oldBinding, roleIds: Array.from(new Set(roleIds)) };
    }, `Bật/tắt role ${roleId}`);
  };

  const batTatGroupChoUser = async (email, groupId) => {
    await capNhatBinding(email, (oldBinding) => {
      const exists = oldBinding.groupIds.includes(groupId);
      const groupIds = exists ? oldBinding.groupIds.filter((x) => x !== groupId) : [...oldBinding.groupIds, groupId];
      return { ...oldBinding, groupIds: Array.from(new Set(groupIds)) };
    }, `Bật/tắt group ${groupId}`);
  };

  const capNhatScopeUser = async (email, scope) => {
    await capNhatBinding(email, (oldBinding) => ({ ...oldBinding, dataScope: scope }), `Cập nhật data scope ${scope}`);
  };

  const batTatOverride = async (email, resourceId, action, mode) => {
    await capNhatBinding(email, (oldBinding) => {
      const key = taoPermissionKey(resourceId, action);
      const allow = new Set(oldBinding.overrides.allow || []);
      const deny = new Set(oldBinding.overrides.deny || []);

      if (mode === 'ALLOW') {
        if (allow.has(key)) allow.delete(key);
        else {
          allow.add(key);
          deny.delete(key);
        }
      } else {
        if (deny.has(key)) deny.delete(key);
        else {
          deny.add(key);
          allow.delete(key);
        }
      }

      return {
        ...oldBinding,
        overrides: { allow: Array.from(allow), deny: Array.from(deny) },
      };
    }, `Override ${mode} ${resourceId}::${action}`);
  };

  const themRole = async () => {
    const id = newRoleId.trim().toUpperCase();
    const name = newRoleName.trim();
    if (!id || !name) {
      Alert.alert('Thiếu thông tin', 'Nhập đầy đủ Mã vai trò và Tên vai trò.');
      return;
    }
    if (cfg.roles.some((r) => r.id === id)) {
      Alert.alert('Trùng mã', 'Mã vai trò đã tồn tại.');
      return;
    }
    try {
      const nextCfg = {
        ...cfg,
        roles: [...cfg.roles, { id, name, inherits: [], dataScope: newRoleScope, system: false }],
        matrix: { ...cfg.matrix, [id]: {} },
      };
      nextCfg.resources.forEach((res) => {
        nextCfg.matrix[id][res.id] = {};
        ['VIEW', ...res.actions].forEach((a) => {
          nextCfg.matrix[id][res.id][a] = false;
        });
      });

      await luuCauHinh(nextCfg, 'THEM_VAI_TRO', id, `Thêm role ${name}`);
      setNewRoleId('');
      setNewRoleName('');
      setNewRoleScope('SELF');
      if (!selectedRoleId) setSelectedRoleId(id);
    } catch (e) {
      Alert.alert('Lỗi thêm vai trò', String(e?.message || 'Không thể thêm vai trò. Vui lòng thử lại.'));
    }
  };

  const batTatKeThuaRole = async (roleId, parentId) => {
    if (roleId === parentId) return;
    try {
      const nextRoles = cfg.roles.map((r) => {
        if (r.id !== roleId) return r;
        const has = (r.inherits || []).includes(parentId);
        const inherits = has ? (r.inherits || []).filter((x) => x !== parentId) : [...(r.inherits || []), parentId];
        return { ...r, inherits };
      });
      await luuCauHinh({ ...cfg, roles: nextRoles }, 'CAP_NHAT_KE_THUA_ROLE', roleId, `Bật/tắt kế thừa parent ${parentId}`);
    } catch (e) {
      Alert.alert('Lỗi cập nhật kế thừa', String(e?.message || 'Không thể cập nhật. Vui lòng thử lại.'));
    }
  };

  const capNhatScopeRole = async (roleId, scope) => {
    try {
      const nextRoles = cfg.roles.map((r) => (r.id === roleId ? { ...r, dataScope: scope } : r));
      await luuCauHinh({ ...cfg, roles: nextRoles }, 'CAP_NHAT_SCOPE_ROLE', roleId, `Cập nhật scope ${scope}`);
    } catch (e) {
      Alert.alert('Lỗi cập nhật scope', String(e?.message || 'Không thể cập nhật. Vui lòng thử lại.'));
    }
  };

  const themGroup = async () => {
    const id = newGroupId.trim().toUpperCase();
    const name = newGroupName.trim();
    if (!id || !name) {
      Alert.alert('Thiếu thông tin', 'Nhập đầy đủ Mã nhóm và Tên nhóm.');
      return;
    }
    if (cfg.groups.some((g) => g.id === id)) {
      Alert.alert('Trùng mã', 'Mã nhóm đã tồn tại.');
      return;
    }
    try {
      await luuCauHinh({ ...cfg, groups: [...cfg.groups, { id, name }] }, 'THEM_NHOM_NGUOI_DUNG', id, `Thêm nhóm ${name}`);
      setNewGroupId('');
      setNewGroupName('');
    } catch (e) {
      Alert.alert('Lỗi thêm nhóm', String(e?.message || 'Không thể thêm nhóm. Vui lòng thử lại.'));
    }
  };

  const themResource = async () => {
    const id = newResId.trim().toUpperCase();
    const name = newResName.trim();
    if (!id || !name) {
      Alert.alert('Thiếu thông tin', 'Nhập tối thiểu Mã tài nguyên và Tên tài nguyên.');
      return;
    }
    if (cfg.resources.some((r) => r.id === id)) {
      Alert.alert('Trùng mã', 'Mã tài nguyên đã tồn tại.');
      return;
    }
    try {
      const resource = {
        id,
        name,
        moduleId: newResModuleId.trim().toUpperCase() || null,
        route: newResRoute.trim() || null,
        actions: ['VIEW', ...RBAC_ACTIONS],
      };

      const nextMatrix = { ...cfg.matrix };
      cfg.roles.forEach((role) => {
        nextMatrix[role.id] = nextMatrix[role.id] || {};
        nextMatrix[role.id][id] = nextMatrix[role.id][id] || {};
        ['VIEW', ...RBAC_ACTIONS].forEach((a) => {
          nextMatrix[role.id][id][a] = role.id === 'ROLE_ADMIN';
        });
      });

      await luuCauHinh(
        { ...cfg, resources: [...cfg.resources, resource], matrix: nextMatrix },
        'THEM_TAI_NGUYEN_DONG',
        id,
        `Thêm resource ${name}`
      );

      setNewResId('');
      setNewResName('');
      setNewResModuleId('');
      setNewResRoute('');
    } catch (e) {
      Alert.alert('Lỗi thêm tài nguyên', String(e?.message || 'Không thể thêm tài nguyên. Vui lòng thử lại.'));
    }
  };

  const batTatPermissionRole = async (roleId, resourceId, action) => {
    try {
      const old = Boolean(cfg.matrix?.[roleId]?.[resourceId]?.[action]);
      const nextCfg = {
        ...cfg,
        matrix: {
          ...cfg.matrix,
          [roleId]: {
            ...(cfg.matrix[roleId] || {}),
            [resourceId]: {
              ...((cfg.matrix[roleId] || {})[resourceId] || {}),
              [action]: !old,
            },
          },
        },
      };
      await luuCauHinh(nextCfg, 'CAP_NHAT_PERMISSION_MATRIX', `${roleId}:${resourceId}:${action}`, `Bật/tắt ${old ? 'OFF' : 'ON'}`);
    } catch (e) {
      Alert.alert('Lỗi lưu ma trận', String(e?.message || 'Không thể cập nhật quyền. Vui lòng thử lại.'));
    }
  };

  const tabs = [
    { id: 'USERS', label: 'Người dùng' },
    { id: 'MATRIX', label: 'Ma trận phân quyền' },
    { id: 'ROLES', label: 'Vai trò và kế thừa' },
    { id: 'RESOURCES', label: 'Danh mục tài nguyên' },
    { id: 'AUDIT', label: 'Nhật ký thao tác' },
  ];

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <Text style={styles.headerTitle}>QUẢN TRỊ PHÂN QUYỀN NÂNG CAO</Text>
      <Text style={styles.headerSub}>Người dùng / Vai trò / Quyền hạn / Nhóm + Ma trận + Ghi đè + Nhật ký</Text>
      <View style={styles.tabRow}>
        {tabs.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.tabBtn, tab === item.id && styles.tabBtnActive]} onPress={() => setTab(item.id)}>
            <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUsers = () => (
    <View>
      <View style={[styles.tabRow, { marginBottom: 12 }]}>
        <TouchableOpacity
          style={[styles.tabBtn, usersSubTab === 'TAI_KHOAN' && styles.tabBtnActive]}
          onPress={() => setUsersSubTab('TAI_KHOAN')}
        >
          <Text style={[styles.tabText, usersSubTab === 'TAI_KHOAN' && styles.tabTextActive]}>Tài khoản & mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, usersSubTab === 'RBAC' && styles.tabBtnActive]}
          onPress={() => setUsersSubTab('RBAC')}
        >
          <Text style={[styles.tabText, usersSubTab === 'RBAC' && styles.tabTextActive]}>Gán quyền (RBAC)</Text>
        </TouchableOpacity>
      </View>

      {usersSubTab === 'TAI_KHOAN' ? (
      <View>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => {
        moModalTaoTaiKhoan();
      }}>
        <Text style={styles.primaryBtnText}>+ THÊM NHÂN VIÊN NỘI BỘ</Text>
      </TouchableOpacity>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng người dùng</Text>
          <Text style={styles.summaryValue}>{thongKeNhanh.tongNguoiDung}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Đang hoạt động</Text>
          <Text style={styles.summaryValue}>{thongKeNhanh.tongDangHoatDong}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Bị khóa</Text>
          <Text style={styles.summaryValue}>{thongKeNhanh.tongBiKhoa}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Admin</Text>
          <Text style={styles.summaryValue}>{thongKeNhanh.tongAdmin}</Text>
        </View>
      </View>

      <View style={styles.backupRow}>
        <Text style={styles.hint}>
          Tài khoản và phân quyền lưu trong IndexedDB — không mất khi build mới. Nên xuất file JSON định kỳ để phòng khi xóa dữ liệu trình duyệt.
        </Text>
        <View style={styles.formRow}>
          <TouchableOpacity
            style={[styles.minorBtn, (dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan) && styles.btnDisabled]}
            onPress={xuatBackupTaiKhoanRbac}
            disabled={dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan}
          >
            {dangXuatBackupTaiKhoan
              ? <ActivityIndicator color={CD.text.primary} />
              : <Text style={styles.minorBtnText}>Xuất sao lưu JSON</Text>}
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <input
                type="file"
                accept=".json,application/json"
                onChange={xuLyPhucHoiBackupTaiKhoanRbac}
                style={{ display: 'none' }}
                id="import-tai-khoan-rbac-backup"
              />
              <TouchableOpacity
                style={[styles.minorBtn, (dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan) && styles.btnDisabled]}
                onPress={() => {
                  const input = document.getElementById('import-tai-khoan-rbac-backup');
                  if (input) input.click();
                }}
                disabled={dangXuatBackupTaiKhoan || dangPhucHoiBackupTaiKhoan}
              >
                {dangPhucHoiBackupTaiKhoan
                  ? <ActivityIndicator color={CD.text.primary} />
                  : <Text style={styles.minorBtnText}>Phục hồi từ JSON</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Tìm theo tên, email, vai trò, trạng thái..."
          placeholderTextColor="#9ca3af"
          value={tuKhoaNguoiDung}
          onChangeText={setTuKhoaNguoiDung}
          autoCapitalize="none"
        />
      </View>

      {users.length === 0 ? <Text style={styles.empty}>Chưa có người dùng.</Text> : null}
      {users.length > 0 && dsNguoiDungDaLoc.length === 0 ? <Text style={styles.empty}>Không có kết quả phù hợp từ khóa tìm kiếm.</Text> : null}

      {dsNguoiDungDaLoc.map((u) => {
        const binding = taoBindingTheoTaiKhoan(cfg.userBindings[u.email] || taoBindingMacDinh(u));
        const dsRole = binding.roleIds.map((id) => trangThaiRole(cfg, id)).join(', ') || 'Chưa gán';
        const dsGroup = binding.groupIds.map((id) => trangThaiGroup(cfg, id)).join(', ') || 'Chưa gán';
        const viewBaoCao = cfg.resources.find((r) => r.route === 'BaoCaoVaThongKe');
        const verdict = viewBaoCao
          ? kiemTraQuyen({ cfg, email: u.email, fallbackRole: u.vaiTro, resourceId: viewBaoCao.id, action: 'VIEW' })
          : { granted: false, dataScope: 'SELF' };

        return (
          <View key={u.email} style={styles.userCard} testID={`user-card-${u.email}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.hoTen || u.ten}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <Text style={styles.userMeta}>Chức danh: {u.chucDanh || 'Chưa cập nhật'}</Text>
              <Text style={styles.userMeta}>Khoa / Phòng: {u.khoa || 'Chưa cập nhật'} / {u.phong || 'Chưa cập nhật'}</Text>
              <Text style={styles.userMeta}>Điện thoại: {u.soDienThoai || 'Chưa cập nhật'}</Text>
              <Text style={styles.userMeta}>Vai trò: {dsRole}</Text>
              <Text style={styles.userMeta}>Nhóm: {dsGroup}</Text>
              <Text style={styles.userMeta}>Phạm vi dữ liệu: {binding.dataScope || verdict.dataScope}</Text>
              <Text style={styles.userMeta} testID={`user-report-view-${u.email}`}>Báo cáo VIEW: {verdict.granted ? 'Cho phép' : 'Từ chối'}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.minorBtn} onPress={() => moModalSuaTaiKhoan(u)}>
                <Text style={styles.minorBtnText}>Sửa hồ sơ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.minorBtn}
                onPress={() => {
                  setSelectedUserEmail(u.email);
                  setUsersSubTab('RBAC');
                }}
              >
                <Text style={styles.minorBtnText}>Gán quyền (RBAC)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.minorBtn} onPress={() => doiTrangThaiTaiKhoan(u)}>
                <Text style={styles.minorBtnText}>{u.trangThai === 'KHOA' ? 'Mở khóa' : 'Khóa'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.minorBtn} onPress={() => moModalMatKhauAdmin(u)}>
                <Text style={styles.minorBtnText}>Đặt mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.minorBtn} onPress={() => sinhMatKhauTamVaLuu(u)}>
                <Text style={styles.minorBtnText}>Mật khẩu tạm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => xoaTaiKhoan(u)}>
                <Text style={styles.dangerBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
        </View>
      ) : (
        <View>
          <Text style={styles.hint}>
            Gán vai trò, nhóm và ghi đè quyền theo email. Đặt mật khẩu / phục hồi mật khẩu thực hiện ở tab &quot;Tài khoản & mật khẩu&quot; — tách khỏi RBAC.
          </Text>
          <Text style={styles.sectionLabel}>Chọn tài khoản</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 }}>
              {users.map((u) => {
                const on = selectedUserEmail === u.email;
                return (
                  <TouchableOpacity
                    key={`rbac-pick-${u.email}`}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setSelectedUserEmail(u.email)}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={1}>
                      {u.email}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          {!selectedUser ? (
            <Text style={styles.empty}>Chọn một email để chỉnh RBAC.</Text>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Phân quyền theo tài khoản: {selectedUser.hoTen || selectedUser.ten || selectedUser.email}</Text>
              <Text style={styles.hint}>{selectedUser.email} · {selectedUser.chucDanh || 'Chưa cập nhật'} · {selectedUser.khoa || 'Chưa cập nhật'} / {selectedUser.phong || 'Chưa cập nhật'}</Text>
              <View style={styles.accountPermissionHero}>
                <Text style={styles.accountPermissionHeroTitle}>{laBindingAdmin(selectedBinding) ? 'ADMIN TOÀN QUYỀN' : 'PHÂN QUYỀN GẮN THEO TÀI KHOẢN'}</Text>
                <Text style={styles.accountPermissionHeroText}>{laBindingAdmin(selectedBinding)
                  ? 'Tài khoản này luôn được mở toàn bộ quyền truy cập, không bị giới hạn bởi ma trận role.'
                  : 'Role, nhóm, phạm vi dữ liệu và quyền ghi đè đang được lưu trực tiếp trên email tài khoản này, không suy diễn theo chức danh.'}</Text>
                {!laBindingAdmin(selectedBinding) ? (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => capAdminToanQuyenChoUser(selectedUser.email)}>
                    <Text style={styles.primaryBtnText}>CẤP ADMIN TOÀN QUYỀN</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.minorBtn} onPress={() => boAdminToanQuyenChoUser(selectedUser.email)}>
                    <Text style={styles.minorBtnText}>BỎ ADMIN TOÀN QUYỀN (BẬT ON/OFF CHI TIẾT)</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionLabel}>Gán đa vai trò</Text>
              <View style={styles.grid2}>
                {cfg.roles.map((role) => {
                  const on = selectedBinding?.roleIds.includes(role.id);
                  return (
                    <TouchableOpacity key={role.id} style={[styles.chip, on && styles.chipOn]} onPress={() => batTatRoleChoUser(selectedUser.email, role.id)}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{role.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Gán nhóm người dùng</Text>
              <View style={styles.grid2}>
                {cfg.groups.map((g) => {
                  const on = selectedBinding?.groupIds.includes(g.id);
                  return (
                    <TouchableOpacity key={g.id} style={[styles.chip, on && styles.chipOn]} onPress={() => batTatGroupChoUser(selectedUser.email, g.id)}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Ghi đè phạm vi dữ liệu</Text>
              <View style={styles.scopeRow}>
                {DATA_SCOPES.map((scope) => (
                  <TouchableOpacity
                    key={scope}
                    style={[styles.scopeBtn, (selectedBinding?.dataScope || '') === scope && styles.scopeBtnActive]}
                    onPress={() => capNhatScopeUser(selectedUser.email, scope)}
                  >
                    <Text style={[styles.scopeText, (selectedBinding?.dataScope || '') === scope && styles.scopeTextActive]}>{scope}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Ghi đè quyền cá nhân (ưu tiên hơn vai trò)</Text>
              {laBindingAdmin(selectedBinding) ? <Text style={styles.hint}>ROLE_ADMIN đang bật nên mọi quyền luôn mở toàn bộ. Ghi đè deny bị khóa để tránh triệt tiêu quyền admin.</Text> : null}
              <ScrollView horizontal>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { width: 240 }]}>Chức năng</Text>
                    {ACCOUNT_ACTIONS.map((a) => (
                      <Text key={a} style={styles.th}>{a}</Text>
                    ))}
                  </View>

                  {cfg.resources.map((res) => (
                    <View key={res.id} style={styles.tableRow}>
                      <Text style={[styles.tdText, { width: 240 }]}>{res.name}</Text>
                      {ACCOUNT_ACTIONS.map((action) => {
                        const key = taoPermissionKey(res.id, action);
                        const allow = selectedBinding?.overrides?.allow.includes(key);
                        const deny = selectedBinding?.overrides?.deny.includes(key);
                        return (
                          <View key={`${res.id}_${action}`} style={styles.overrideCell}>
                            <TouchableOpacity
                              style={[styles.ovrBtn, allow && styles.ovrAllow, laBindingAdmin(selectedBinding) && styles.ovrDisabled]}
                              onPress={() => batTatOverride(selectedUser.email, res.id, action, 'ALLOW')}
                              disabled={laBindingAdmin(selectedBinding)}
                            >
                              <Text style={styles.ovrText}>A</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.ovrBtn, deny && styles.ovrDeny, laBindingAdmin(selectedBinding) && styles.ovrDisabled]}
                              onPress={() => batTatOverride(selectedUser.email, res.id, action, 'DENY')}
                              disabled={laBindingAdmin(selectedBinding)}
                            >
                              <Text style={styles.ovrText}>D</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.backInline} onPress={() => setSelectedUserEmail('')}>
                <Text style={styles.backInlineText}>Bỏ chọn tài khoản</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderRoleMatrix = () => {
    const role = cfg.roles.find((r) => r.id === selectedRoleId) || cfg.roles[0];
    if (!role) return <Text style={styles.empty}>Không có vai trò nào.</Text>;

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ma trận phân quyền</Text>
        <Text style={styles.hint}>Bảng quyền: | Chức năng | Xem | Thêm | Sửa | Xóa | Xuất file |</Text>

        <View style={styles.grid2}>
          {cfg.roles.map((r) => (
            <TouchableOpacity key={r.id} style={[styles.chip, selectedRoleId === r.id && styles.chipOn]} onPress={() => setSelectedRoleId(r.id)}>
              <Text style={[styles.chipText, selectedRoleId === r.id && styles.chipTextOn]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {role.id === 'ROLE_ADMIN' ? (
          <Text style={styles.hint}>ROLE_ADMIN luôn toàn quyền và không cho phép bật/tắt thủ công. Hãy chọn vai trò khác để cấu hình on/off.</Text>
        ) : null}

        <ScrollView horizontal>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 280 }]}>Chức năng / Tài nguyên</Text>
              <Text style={styles.th}>Xem</Text>
              <Text style={styles.th}>Thêm</Text>
              <Text style={styles.th}>Sửa</Text>
              <Text style={styles.th}>Xóa</Text>
              <Text style={styles.th}>Xuất file</Text>
            </View>
            {cfg.resources.map((res) => (
              <View key={res.id} style={styles.tableRow}>
                <Text style={[styles.tdText, { width: 280 }]}>{res.name}</Text>
                {['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'].map((a) => (
                  <View key={`${res.id}_${a}`} style={styles.switchCell}>
                    <Switch
                      value={role.id === 'ROLE_ADMIN' ? true : Boolean(cfg.matrix?.[role.id]?.[res.id]?.[a])}
                      onValueChange={() => batTatPermissionRole(role.id, res.id, a)}
                      disabled={role.id === 'ROLE_ADMIN'}
                      trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#E91E63' }}
                      thumbColor={(role.id === 'ROLE_ADMIN' || Boolean(cfg.matrix?.[role.id]?.[res.id]?.[a])) ? '#fff' : '#d1d5db'}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderRoleEditor = () => (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Quản lý vai trò & kế thừa</Text>

      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Mã vai trò (VD: ROLE_KPI)" placeholderTextColor="#9ca3af" value={newRoleId} onChangeText={setNewRoleId} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Tên vai trò" placeholderTextColor="#9ca3af" value={newRoleName} onChangeText={setNewRoleName} />
      </View>

      <View style={styles.scopeRow}>
        {DATA_SCOPES.map((scope) => (
          <TouchableOpacity key={scope} style={[styles.scopeBtn, newRoleScope === scope && styles.scopeBtnActive]} onPress={() => setNewRoleScope(scope)}>
            <Text style={[styles.scopeText, newRoleScope === scope && styles.scopeTextActive]}>{scope}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={themRole}>
        <Text style={styles.primaryBtnText}>THÊM VAI TRÒ</Text>
      </TouchableOpacity>

      {cfg.roles.map((role) => (
        <View key={role.id} style={styles.roleCard}>
          <Text style={styles.roleTitle}>{role.name} ({role.id})</Text>
          <Text style={styles.roleMeta}>Phạm vi dữ liệu vai trò: {role.dataScope}</Text>

          <View style={styles.scopeRow}>
            {DATA_SCOPES.map((scope) => (
              <TouchableOpacity key={`${role.id}_${scope}`} style={[styles.scopeBtn, role.dataScope === scope && styles.scopeBtnActive]} onPress={() => capNhatScopeRole(role.id, scope)}>
                <Text style={[styles.scopeText, role.dataScope === scope && styles.scopeTextActive]}>{scope}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Kế thừa vai trò</Text>
          <View style={styles.grid2}>
            {cfg.roles.filter((r) => r.id !== role.id).map((parent) => {
              const on = (role.inherits || []).includes(parent.id);
              return (
                <TouchableOpacity key={`${role.id}_${parent.id}`} style={[styles.chip, on && styles.chipOn]} onPress={() => batTatKeThuaRole(role.id, parent.id)}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{parent.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const renderResourceEditor = () => (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Danh mục tài nguyên động (không cần sửa code)</Text>

      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Mã tài nguyên (VD: RES_KPI)" placeholderTextColor="#9ca3af" value={newResId} onChangeText={setNewResId} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Tên tài nguyên" placeholderTextColor="#9ca3af" value={newResName} onChangeText={setNewResName} />
      </View>
      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Module ID (VD: MOD_KPI)" placeholderTextColor="#9ca3af" value={newResModuleId} onChangeText={setNewResModuleId} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Route (VD: BaoCaoVaThongKe)" placeholderTextColor="#9ca3af" value={newResRoute} onChangeText={setNewResRoute} />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={themResource}>
        <Text style={styles.primaryBtnText}>THÊM TÀI NGUYÊN ĐỘNG</Text>
      </TouchableOpacity>

      {cfg.resources.map((res) => (
        <View key={res.id} style={styles.resourceCard}>
          <Text style={styles.roleTitle}>{res.name} ({res.id})</Text>
          <Text style={styles.roleMeta}>moduleId: {res.moduleId || '-'} · route: {res.route || '-'}</Text>
          <Text style={styles.roleMeta}>actions: {['VIEW', ...RBAC_ACTIONS].join(', ')}</Text>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Quản lý nhóm người dùng</Text>
      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Mã nhóm (VD: GRP_SAN)" placeholderTextColor="#9ca3af" value={newGroupId} onChangeText={setNewGroupId} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Tên nhóm" placeholderTextColor="#9ca3af" value={newGroupName} onChangeText={setNewGroupName} />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={themGroup}>
        <Text style={styles.primaryBtnText}>THÊM NHÓM</Text>
      </TouchableOpacity>

      {cfg.groups.map((g) => (
        <View key={g.id} style={styles.resourceCard}>
          <Text style={styles.roleTitle}>{g.name} ({g.id})</Text>
        </View>
      ))}
    </View>
  );

  const renderAudit = () => (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Nhật ký thao tác (JCI traceability)</Text>
      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Lọc theo email" placeholderTextColor="#9ca3af" value={locEmailNhatKy} onChangeText={setLocEmailNhatKy} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Từ khóa hành động" placeholderTextColor="#9ca3af" value={tuKhoaNhatKy} onChangeText={setTuKhoaNhatKy} />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => napNhatKy()}>
        <Text style={styles.primaryBtnText}>LỌC NHẬT KÝ</Text>
      </TouchableOpacity>

      {auditRows.length === 0 ? <Text style={styles.empty}>Chưa có dữ liệu nhật ký.</Text> : null}
      {auditRows.map((log) => (
        <View key={log.id} style={styles.auditItem}>
          <Text style={styles.auditMeta}>{new Date(log.thoiGian).toLocaleString('vi-VN')} · {log.taiKhoan || 'N/A'}</Text>
          <Text style={styles.auditMain}>{log.hanhDong} · {log.doiTuong || 'HE_THONG'}</Text>
          {!!log.chiTiet && <Text style={styles.auditMeta}>{log.chiTiet}</Text>}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {tab === 'USERS' && renderUsers()}
          {tab === 'MATRIX' && renderRoleMatrix()}
          {tab === 'ROLES' && renderRoleEditor()}
          {tab === 'RESOURCES' && renderResourceEditor()}
          {tab === 'AUDIT' && renderAudit()}
        </ScrollView>

        <TouchableOpacity style={styles.backBtn} onPress={() => quayLaiAnToan(navigation, 'TongQuan')}>
          <Text style={styles.backBtnText}>Thoát về Tổng quan</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCreateUser} transparent animationType="slide" onRequestClose={dongModalTaoTaiKhoan}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>TẠO TÀI KHOẢN NỘI BỘ</Text>
            <Text style={styles.hint}>Phân quyền được liên kết trực tiếp theo email tài khoản ngay khi tạo. Khoa, phòng, chức danh chỉ là thông tin hồ sơ, không khóa quyền truy cập.</Text>
            <View style={styles.modalTabRow}>
              {CREATE_ACCOUNT_TABS.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.modalTabBtn, createUserTab === item.id && styles.modalTabBtnActive]} onPress={() => setCreateUserTab(item.id)}>
                  <Text style={[styles.modalTabText, createUserTab === item.id && styles.modalTabTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {!!thongBaoTaoTaiKhoan ? (
                <View style={[styles.inlineNotice, capDoThongBaoTaoTaiKhoan === 'ERROR' ? styles.inlineNoticeError : (capDoThongBaoTaoTaiKhoan === 'SUCCESS' ? styles.inlineNoticeSuccess : styles.inlineNoticeInfo)]}>
                  <Text style={styles.inlineNoticeText}>{thongBaoTaoTaiKhoan}</Text>
                </View>
              ) : null}
              {createUserTab === 'PROFILE' ? (
                <View>
                  <TextInput style={styles.input} placeholder="Họ và tên *" placeholderTextColor="#9ca3af" value={newName} onChangeText={setNewName} />
                  <View style={styles.formRow}>
                    <TextInput style={styles.input} placeholder="Khoa" placeholderTextColor="#9ca3af" value={newDepartment} onChangeText={setNewDepartment} />
                    <TextInput style={styles.input} placeholder="Phòng / Bộ phận" placeholderTextColor="#9ca3af" value={newRoom} onChangeText={setNewRoom} />
                  </View>
                  <View style={styles.formRow}>
                    <TextInput style={styles.input} placeholder="Chức danh" placeholderTextColor="#9ca3af" value={newTitle} onChangeText={setNewTitle} />
                    <TextInput style={styles.input} placeholder="Số điện thoại liên lạc" placeholderTextColor="#9ca3af" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
                  </View>
                  <TextInput style={styles.input} placeholder="Email *" placeholderTextColor="#9ca3af" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu ban đầu *"
                    placeholderTextColor="#9ca3af"
                    value={newPass}
                    onChangeText={setNewPass}
                    secureTextEntry
                    onSubmitEditing={taoTaiKhoan}
                    returnKeyType="done"
                  />
                </View>
              ) : (
                <View>
                  <View style={styles.accountPermissionHero}>
                    <Text style={styles.accountPermissionHeroTitle}>{laBindingAdmin(bindingNguoiDungMoi) ? 'ADMIN TOÀN QUYỀN' : 'PHÂN QUYỀN KHỞI TẠO'}</Text>
                    <Text style={styles.accountPermissionHeroText}>{laBindingAdmin(bindingNguoiDungMoi)
                      ? 'Tài khoản mới này sẽ được mở toàn bộ quyền truy cập ngay sau khi tạo.'
                      : 'Vai trò, nhóm, phạm vi dữ liệu và quyền cá nhân đang được gắn trực tiếp vào email tài khoản mới. Không có quyền mặc định cứng theo chức danh.'}</Text>
                    {!laBindingAdmin(bindingNguoiDungMoi) ? (
                      <TouchableOpacity style={styles.primaryBtn} onPress={() => capNhatDraftTaoTaiKhoan({ roleIds: ['ROLE_ADMIN'], groupIds: [], overrides: { allow: [], deny: [] }, dataScope: 'ALL' })}>
                        <Text style={styles.primaryBtnText}>CẤP ADMIN TOÀN QUYỀN</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.minorBtn} onPress={boAdminToanQuyenChoNguoiDungMoi}>
                        <Text style={styles.minorBtnText}>BỎ ADMIN TOÀN QUYỀN (BẬT ON/OFF CHI TIẾT)</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.sectionLabel}>Gán vai trò cho tài khoản mới</Text>
                  <View style={styles.grid2}>
                    {cfg.roles.map((role) => {
                      const on = bindingNguoiDungMoi.roleIds.includes(role.id);
                      return (
                        <TouchableOpacity key={`create-role-${role.id}`} style={[styles.chip, on && styles.chipOn]} onPress={() => batTatRoleChoNguoiDungMoi(role.id)}>
                          <Text style={[styles.chipText, on && styles.chipTextOn]}>{role.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionLabel}>Liên kết nhóm tài khoản</Text>
                  <View style={styles.grid2}>
                    {cfg.groups.map((group) => {
                      const on = bindingNguoiDungMoi.groupIds.includes(group.id);
                      return (
                        <TouchableOpacity key={`create-group-${group.id}`} style={[styles.chip, on && styles.chipOn]} onPress={() => batTatGroupChoNguoiDungMoi(group.id)}>
                          <Text style={[styles.chipText, on && styles.chipTextOn]}>{group.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionLabel}>Phạm vi dữ liệu ban đầu</Text>
                  <View style={styles.scopeRow}>
                    {DATA_SCOPES.map((scope) => (
                      <TouchableOpacity
                        key={`create-scope-${scope}`}
                        style={[styles.scopeBtn, (bindingNguoiDungMoi.dataScope || '') === scope && styles.scopeBtnActive]}
                        onPress={() => capNhatDraftTaoTaiKhoan({ ...bindingNguoiDungMoi, dataScope: scope })}
                      >
                        <Text style={[styles.scopeText, (bindingNguoiDungMoi.dataScope || '') === scope && styles.scopeTextActive]}>{scope}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionLabel}>Ghi đè quyền ngay khi tạo</Text>
                  {laBindingAdmin(bindingNguoiDungMoi) ? <Text style={styles.hint}>Tài khoản admin luôn full quyền nên phần ghi đè deny được khóa.</Text> : null}
                  <ScrollView horizontal>
                    <View>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.th, { width: 240 }]}>Chức năng</Text>
                        {ACCOUNT_ACTIONS.map((action) => (
                          <Text key={`create-header-${action}`} style={styles.th}>{action}</Text>
                        ))}
                      </View>
                      {cfg.resources.map((res) => (
                        <View key={`create-res-${res.id}`} style={styles.tableRow}>
                          <Text style={[styles.tdText, { width: 240 }]}>{res.name}</Text>
                          {ACCOUNT_ACTIONS.map((action) => {
                            const key = taoPermissionKey(res.id, action);
                            const allow = bindingNguoiDungMoi.overrides.allow.includes(key);
                            const deny = bindingNguoiDungMoi.overrides.deny.includes(key);
                            return (
                              <View key={`create-${res.id}-${action}`} style={styles.overrideCell}>
                                <TouchableOpacity
                                  style={[styles.ovrBtn, allow && styles.ovrAllow, laBindingAdmin(bindingNguoiDungMoi) && styles.ovrDisabled]}
                                  onPress={() => batTatOverrideChoNguoiDungMoi(res.id, action, 'ALLOW')}
                                  disabled={laBindingAdmin(bindingNguoiDungMoi)}
                                >
                                  <Text style={styles.ovrText}>A</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.ovrBtn, deny && styles.ovrDeny, laBindingAdmin(bindingNguoiDungMoi) && styles.ovrDisabled]}
                                  onPress={() => batTatOverrideChoNguoiDungMoi(res.id, action, 'DENY')}
                                  disabled={laBindingAdmin(bindingNguoiDungMoi)}
                                >
                                  <Text style={styles.ovrText}>D</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              {!!thongBaoTaoTaiKhoan ? (
                <Text style={styles.modalActionHint}>{thongBaoTaoTaiKhoan}</Text>
              ) : null}
              <TouchableOpacity style={styles.minorBtn} onPress={dongModalTaoTaiKhoan}>
                <Text style={styles.minorBtnText}>Hủy</Text>
              </TouchableOpacity>
              {createUserTab === 'PROFILE' ? (
                <TouchableOpacity style={styles.minorBtn} onPress={() => setCreateUserTab('PERMISSIONS')}>
                  <Text style={styles.minorBtnText}>Sang phân quyền</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={[styles.primaryBtn, dangTaoTaiKhoan && styles.btnDisabled]} onPress={bamTaoTaiKhoan} disabled={dangTaoTaiKhoan}>
                <Text style={styles.primaryBtnText}>{dangTaoTaiKhoan ? 'Đang tạo...' : 'Tạo tài khoản & gán quyền'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditUser} transparent animationType="slide" onRequestClose={() => setShowEditUser(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>CẬP NHẬT HỒ SƠ TÀI KHOẢN</Text>
            <Text style={styles.modalReadonly}>{editingUser?.email || ''}</Text>
            <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#9ca3af" value={newName} onChangeText={setNewName} />
            <View style={styles.formRow}>
              <TextInput style={styles.input} placeholder="Khoa" placeholderTextColor="#9ca3af" value={newDepartment} onChangeText={setNewDepartment} />
              <TextInput style={styles.input} placeholder="Phòng / Bộ phận" placeholderTextColor="#9ca3af" value={newRoom} onChangeText={setNewRoom} />
            </View>
            <View style={styles.formRow}>
              <TextInput style={styles.input} placeholder="Chức danh" placeholderTextColor="#9ca3af" value={newTitle} onChangeText={setNewTitle} />
              <TextInput style={styles.input} placeholder="Số điện thoại liên lạc" placeholderTextColor="#9ca3af" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.minorBtn} onPress={() => setShowEditUser(false)}>
                <Text style={styles.minorBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, dangLuuHoSoTaiKhoan && styles.btnDisabled]} onPress={luuHoSoTaiKhoan} disabled={dangLuuHoSoTaiKhoan}>
                <Text style={styles.primaryBtnText}>{dangLuuHoSoTaiKhoan ? 'Đang lưu...' : 'Lưu hồ sơ'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!modalMatKhau} transparent animationType="fade" onRequestClose={dongModalMatKhauAdmin}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ĐẶT MẬT KHẨU (ADMIN)</Text>
            <Text style={styles.hint}>Tài khoản: {modalMatKhau?.email || ''}</Text>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={mkAdminMoi}
              onChangeText={setMkAdminMoi}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={mkAdminXacNhan}
              onChangeText={setMkAdminXacNhan}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 10 }}>
              <Text style={styles.hint}>Bắt buộc đổi khi đăng nhập lại</Text>
              <Switch value={buocDoiSauDoiAdmin} onValueChange={setBuocDoiSauDoiAdmin} />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.minorBtn} onPress={dongModalMatKhauAdmin}>
                <Text style={styles.minorBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, dangLuuMatKhauAdmin && styles.btnDisabled]} onPress={luuMatKhauAdminTuModal} disabled={dangLuuMatKhauAdmin}>
                <Text style={styles.primaryBtnText}>{dangLuuMatKhauAdmin ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  container: { flex: 1, padding: 20 },

  headerCard: {
    backgroundColor: CD.brand.mauDam,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CD.border.header,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, boxShadow: CD.web.shadow_header } }),
  },
  headerTitle: { fontFamily: CD.font.family, fontSize: 30, fontWeight: '900', color: CD.text.primary },
  headerSub: { fontFamily: CD.font.family, fontSize: 20, color: CD.text.secondary, marginTop: 4 },

  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' },
  tabBtnActive: { backgroundColor: CD.brand.mauChinh },
  tabText: { color: CD.text.secondary, fontWeight: '700' },
  tabTextActive: { color: CD.text.primary },

  panel: {
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  panelTitle: { fontFamily: CD.font.family, fontSize: 24, fontWeight: '900', color: CD.brand.mauNhat, marginBottom: 10 },
  hint: { color: CD.text.secondary, marginBottom: 8 },
  sectionLabel: { color: CD.text.primary, fontSize: 18, fontWeight: '800', marginTop: 10, marginBottom: 6 },

  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 10 },
  backupRow: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  summaryCard: {
    minWidth: 150,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: CD.border.glass_md,
  },
  summaryLabel: { color: CD.text.secondary, fontSize: 12, fontWeight: '700' },
  summaryValue: { color: CD.text.primary, fontSize: 20, fontWeight: '900', marginTop: 2 },

  formRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  input: {
    flex: 1,
    minWidth: 220,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  primaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: CD.brand.mauChinh,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalReadonly: {
    color: CD.text.secondary,
    fontSize: 14,
    marginBottom: 10,
  },
  primaryBtnText: { color: CD.text.primary, fontWeight: '800', fontSize: 15 },

  minorBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  minorBtnText: { color: CD.text.primary, fontWeight: '700', fontSize: 13 },

  dangerBtn: {
    backgroundColor: 'rgba(244,67,54,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.5)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dangerBtnText: { color: '#fee2e2', fontWeight: '700', fontSize: 13 },

  userCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  userName: { color: CD.text.primary, fontSize: 20, fontWeight: '900', fontFamily: CD.font.family },
  userEmail: { color: CD.brand.mauNhat, marginTop: 2 },
  userMeta: { color: CD.text.secondary, marginTop: 2 },
  userActions: { justifyContent: 'center', gap: 6 },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipOn: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },
  chipText: { color: CD.text.secondary, fontWeight: '700' },
  chipTextOn: { color: CD.text.primary },

  scopeRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  scopeBtn: { borderRadius: 10, borderWidth: 1, borderColor: CD.border.glass_md, paddingVertical: 8, paddingHorizontal: 12 },
  scopeBtnActive: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  scopeText: { color: CD.text.secondary, fontWeight: '700' },
  scopeTextActive: { color: '#fff' },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: CD.brand.mauDam,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  th: { width: 110, color: CD.text.primary, fontWeight: '800', textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tdText: { color: CD.text.primary, fontSize: 13 },
  switchCell: { width: 110, alignItems: 'center' },

  overrideCell: { width: 110, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  ovrBtn: {
    width: 36,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ovrAllow: { backgroundColor: 'rgba(16,185,129,0.35)', borderColor: '#10b981' },
  ovrDeny: { backgroundColor: 'rgba(239,68,68,0.35)', borderColor: '#ef4444' },
  ovrDisabled: { opacity: 0.45 },
  ovrText: { color: '#fff', fontWeight: '800' },

  accountPermissionHero: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    marginBottom: 12,
  },
  accountPermissionHeroTitle: { color: CD.text.primary, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  accountPermissionHeroText: { color: CD.text.secondary, marginBottom: 8 },

  roleCard: {
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  resourceCard: {
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  roleTitle: { color: CD.text.primary, fontWeight: '800', fontSize: 16 },
  roleMeta: { color: CD.text.secondary, marginTop: 4 },

  auditItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
  },
  auditMeta: { color: CD.text.secondary, fontSize: 12 },
  auditMain: { color: CD.text.primary, fontWeight: '800', marginTop: 2, marginBottom: 2 },

  empty: { textAlign: 'center', color: CD.text.muted, marginTop: 16, marginBottom: 16 },
  backInline: { alignSelf: 'flex-start', marginTop: 10 },
  backInlineText: { color: CD.brand.mauNhat, textDecorationLine: 'underline' },

  backBtn: { position: 'absolute', right: 20, bottom: 16, backgroundColor: CD.brand.mauDam, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
  backBtnText: { color: CD.text.primary, fontWeight: '800' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: {
    backgroundColor: CD.bg.glass_modal,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontFamily: CD.font.family, fontSize: 24, color: CD.brand.mauNhat, fontWeight: '900', marginBottom: 10 },
  modalTabRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  modalTabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalTabBtnActive: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },
  modalTabText: { color: CD.text.secondary, fontWeight: '800' },
  modalTabTextActive: { color: CD.text.primary },
  modalScroll: { maxHeight: 560 },
  modalScrollContent: { paddingBottom: 8 },
  inlineNotice: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inlineNoticeInfo: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.45)',
  },
  inlineNoticeError: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.5)',
  },
  inlineNoticeSuccess: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.5)',
  },
  inlineNoticeText: {
    color: CD.text.primary,
    fontWeight: '700',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  modalActionHint: {
    width: '100%',
    color: CD.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
});
