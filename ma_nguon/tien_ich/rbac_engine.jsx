import { Platform } from 'react-native';
import { tenantGetItem, tenantRemoveItem, tenantSetItem } from './tenant_storage';

export const RBAC_KEYS = {
  RESOURCES: 'RBAC_RESOURCES_V1',
  ROLES: 'RBAC_ROLES_V1',
  GROUPS: 'RBAC_GROUPS_V1',
  MATRIX: 'RBAC_ROLE_MATRIX_V1',
  USER_BINDINGS: 'RBAC_USER_BINDINGS_V1',
};

export const RBAC_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'];

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const docStorage = async (key) => {
  if (laMoiTruongWeb()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue !== null && localValue !== undefined) return localValue;
    } catch {
      // fallback AsyncStorage
    }
  }

  return tenantGetItem(key);
};

const ghiStorage = async (key, value) => {
  const normalizedValue = String(value || '');
  const tasks = [tenantSetItem(key, normalizedValue).catch(() => {})];

  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.setItem(key, normalizedValue);
      } catch {
        // ignore localStorage write error
      }
    })());
  }

  await Promise.all(tasks);
};

const xoaStorage = async (key) => {
  const tasks = [tenantRemoveItem(key).catch(() => {})];

  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore localStorage remove error
      }
    })());
  }

  await Promise.all(tasks);
};

export const xoaLegacyAclTheoEmail = async (email) => {
  const emailChuan = String(email || '').trim().toLowerCase();
  if (!emailChuan) return;
  await xoaStorage(`ACL_USER_${emailChuan}`);
};

const DEFAULT_RESOURCES = [
  { id: 'RES_DASHBOARD', name: 'Tổng quan', moduleId: 'MOD_DASHBOARD', route: 'TongQuan', actions: ['VIEW'] },
  { id: 'RES_CONG_HIS', name: 'Kết nối HIS', moduleId: 'MOD_CONG_HIS', route: 'CongHIS', actions: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'] },
  { id: 'RES_KHO_LUU_TRU', name: 'Kho lưu trữ', moduleId: 'MOD_KHO_LUU_TRU', route: 'KhoLuuTru', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_DOC_XML', name: 'Đọc XML', moduleId: 'MOD_XML_GIAM_DINH', route: 'DocXML', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_CHUYEN_MON', name: 'Quản lý chuyên môn', moduleId: 'MOD_CHUYEN_MON', route: 'QuanLyChuyenMon', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_DANH_MUC_NOI_BO', name: 'Danh mục nội bộ', moduleId: 'MOD_DANH_MUC', route: 'QuanLyDanhMuc', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_MAPPING_DM', name: 'Hub mapping nghiệp vụ (DM)', moduleId: 'MOD_MAPPING_DM', route: 'MappingNghiepVu', actions: ['VIEW'] },
  { id: 'RES_DANH_MUC_BYT', name: 'Danh mục Bộ Y tế', moduleId: 'MOD_DANH_MUC_BYT', route: 'DanhMucBYTMain', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_LUAT_BHYT', name: 'Quản lý luật BHYT', moduleId: 'MOD_QUAN_LY_LUAT', route: 'QuanLyLuat', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_QUY_TAC', name: 'Quản lý quy tắc on/off', moduleId: 'MOD_QUY_TAC_ON_OFF', route: 'QuanLyQuyTacOnOff', actions: ['VIEW', 'UPDATE'] },
  { id: 'RES_BAO_CAO', name: 'Báo cáo và thống kê', moduleId: 'MOD_BAO_CAO_THONG_KE', route: 'BaoCaoVaThongKe', actions: ['VIEW', 'EXPORT'] },
  { id: 'RES_PHAN_QUYEN', name: 'Quản trị phân quyền', moduleId: 'MOD_ACL', route: 'PhanQuyenTruyCap', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
  { id: 'RES_HELPER', name: 'Helper vận hành', moduleId: 'MOD_HELPER', route: 'Helper', actions: ['VIEW'] },
  { id: 'RES_THU_VIEN', name: 'Thư viện tài liệu', moduleId: 'MOD_THU_VIEN', route: 'ThuVien', actions: ['VIEW'] },
  { id: 'RES_TRO_LY_TRI_THUC', name: 'Trợ lý tri thức kiểm tra (RAG nội bộ)', moduleId: 'MOD_TRO_LY_TRI_THUC', route: 'TroLyTriThuc', actions: ['VIEW'] },
  { id: 'RES_XML1', name: 'XML1', moduleId: null, route: 'XML1', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_XML2', name: 'XML2', moduleId: null, route: 'XML2', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_XML3', name: 'XML3', moduleId: null, route: 'XML3', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_XML4', name: 'XML4', moduleId: null, route: 'XML4', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_XML5', name: 'XML5', moduleId: null, route: 'XML5', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_XML6', name: 'XML6', moduleId: null, route: 'XML6', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
  { id: 'RES_CASE_DETAIL', name: 'Chi tiết ca bệnh', moduleId: null, route: 'ChiTiet', actions: ['VIEW', 'UPDATE', 'EXPORT'] },
  { id: 'RES_EDIT_XML', name: 'Sửa file XML', moduleId: null, route: 'SuaFileXML', actions: ['VIEW', 'UPDATE'] },
];

const DEFAULT_ROLES = [
  { id: 'ROLE_ADMIN', name: 'Admin', inherits: [], dataScope: 'ALL', system: true },
  { id: 'ROLE_DOCTOR', name: 'Bác sĩ điều trị', inherits: [], dataScope: 'SELF', system: true },
  { id: 'ROLE_NURSE', name: 'Điều dưỡng', inherits: [], dataScope: 'GROUP', system: true },
  { id: 'ROLE_ACCOUNTANT', name: 'Kế toán', inherits: [], dataScope: 'GROUP', system: true },
  { id: 'ROLE_QUALITY_MANAGER', name: 'Quản lý chất lượng', inherits: [], dataScope: 'ALL', system: true },
  { id: 'ROLE_HEAD_OF_DEPT', name: 'Trưởng khoa', inherits: ['ROLE_DOCTOR'], dataScope: 'GROUP', system: true },
];

const DEFAULT_GROUPS = [
  { id: 'GRP_SAN', name: 'Khoa Sản' },
  { id: 'GRP_NHI', name: 'Khoa Nhi' },
  { id: 'GRP_NOI', name: 'Khoa Nội' },
  { id: 'GRP_NGOAI', name: 'Khoa Ngoại' },
  { id: 'GRP_KHTH', name: 'Phòng Kế hoạch Tổng hợp' },
];

const jsonArray = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const jsonObject = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const uniq = (arr) => Array.from(new Set((Array.isArray(arr) ? arr : []).filter(Boolean)));

const chuanHoaResource = (r) => ({
  id: String(r?.id || '').trim(),
  name: String(r?.name || '').trim(),
  moduleId: r?.moduleId ? String(r.moduleId).trim() : null,
  route: r?.route ? String(r.route).trim() : null,
  actions: uniq((r?.actions || []).map((x) => String(x || '').toUpperCase())).filter((x) => RBAC_ACTIONS.includes(x) || x === 'VIEW'),
});

const chuanHoaRole = (r) => ({
  id: String(r?.id || '').trim(),
  name: String(r?.name || '').trim(),
  inherits: uniq((r?.inherits || []).map((x) => String(x || '').trim())),
  dataScope: ['SELF', 'GROUP', 'ALL'].includes(String(r?.dataScope || '').toUpperCase())
    ? String(r.dataScope).toUpperCase()
    : 'SELF',
  system: r?.system === true,
});

const chuanHoaGroup = (g) => ({ id: String(g?.id || '').trim(), name: String(g?.name || '').trim() });

const chuanHoaBinding = (binding) => ({
  roleIds: uniq((binding?.roleIds || []).map((x) => String(x || '').trim())),
  groupIds: uniq((binding?.groupIds || []).map((x) => String(x || '').trim())),
  overrides: {
    allow: uniq((binding?.overrides?.allow || []).map((x) => String(x || '').trim())),
    deny: uniq((binding?.overrides?.deny || []).map((x) => String(x || '').trim())),
  },
  dataScope: ['SELF', 'GROUP', 'ALL'].includes(String(binding?.dataScope || '').toUpperCase())
    ? String(binding.dataScope).toUpperCase()
    : null,
});

  const taoBindingRong = () => chuanHoaBinding({ roleIds: [], groupIds: [], overrides: { allow: [], deny: [] }, dataScope: 'SELF' });

const mergeDefaults = (existing, defaults, key = 'id', normalizeFn = (x) => x) => {
  const map = new Map();
  defaults.forEach((item) => {
    const normalized = normalizeFn(item);
    if (normalized[key]) map.set(normalized[key], normalized);
  });
  (Array.isArray(existing) ? existing : []).forEach((item) => {
    const normalized = normalizeFn(item);
    if (!normalized[key]) return;
    map.set(normalized[key], { ...map.get(normalized[key]), ...normalized });
  });
  return Array.from(map.values());
};

const taoMatrixMacDinh = (roles, resources) => {
  const matrix = {};
  roles.forEach((role) => {
    matrix[role.id] = matrix[role.id] || {};
    resources.forEach((res) => {
      const actionMap = {};
      res.actions.forEach((a) => {
        actionMap[a] = role.id === 'ROLE_ADMIN';
      });
      if (res.actions.includes('VIEW') === false) actionMap.VIEW = role.id === 'ROLE_ADMIN';
      matrix[role.id][res.id] = actionMap;
    });
  });

  resources.forEach((res) => {
    const has = (roleId, action) => Boolean(matrix?.[roleId]?.[res.id]?.[action]);
    const set = (roleId, action, value) => {
      matrix[roleId] = matrix[roleId] || {};
      matrix[roleId][res.id] = matrix[roleId][res.id] || {};
      matrix[roleId][res.id][action] = value;
    };

    if (res.moduleId === 'MOD_BAO_CAO_THONG_KE') {
      set('ROLE_DOCTOR', 'VIEW', true);
      set('ROLE_DOCTOR', 'EXPORT', true);
      set('ROLE_HEAD_OF_DEPT', 'VIEW', true);
      set('ROLE_HEAD_OF_DEPT', 'EXPORT', true);
      set('ROLE_QUALITY_MANAGER', 'VIEW', true);
      set('ROLE_QUALITY_MANAGER', 'EXPORT', true);
    }

    if (res.moduleId === 'MOD_XML_GIAM_DINH') {
      set('ROLE_DOCTOR', 'VIEW', true);
      set('ROLE_DOCTOR', 'CREATE', true);
      set('ROLE_DOCTOR', 'UPDATE', true);
      set('ROLE_NURSE', 'VIEW', true);
      set('ROLE_NURSE', 'CREATE', true);
      set('ROLE_QUALITY_MANAGER', 'VIEW', true);
      set('ROLE_QUALITY_MANAGER', 'UPDATE', true);
    }

    if (res.moduleId === 'MOD_CHUYEN_MON') {
      set('ROLE_DOCTOR', 'VIEW', true);
      set('ROLE_DOCTOR', 'CREATE', true);
      set('ROLE_HEAD_OF_DEPT', 'UPDATE', true);
      set('ROLE_QUALITY_MANAGER', 'VIEW', true);
      set('ROLE_QUALITY_MANAGER', 'UPDATE', true);
    }

    if (res.moduleId === 'MOD_ACL') {
      RBAC_ACTIONS.concat(['VIEW']).forEach((a) => set('ROLE_ADMIN', a, true));
    }

    if (res.moduleId === 'MOD_DASHBOARD') {
      ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ACCOUNTANT', 'ROLE_QUALITY_MANAGER', 'ROLE_HEAD_OF_DEPT'].forEach((r) => {
        if (!has(r, 'VIEW')) set(r, 'VIEW', true);
      });
    }

    if (res.moduleId === 'MOD_THU_VIEN') {
      ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ACCOUNTANT', 'ROLE_QUALITY_MANAGER', 'ROLE_HEAD_OF_DEPT'].forEach((r) => {
        if (!has(r, 'VIEW')) set(r, 'VIEW', true);
      });
    }

    if (res.moduleId === 'MOD_TRO_LY_TRI_THUC') {
      ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ACCOUNTANT', 'ROLE_QUALITY_MANAGER', 'ROLE_HEAD_OF_DEPT'].forEach((r) => {
        if (!has(r, 'VIEW')) set(r, 'VIEW', true);
      });
    }

    if (res.moduleId === 'MOD_CONG_HIS') {
      ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ACCOUNTANT', 'ROLE_QUALITY_MANAGER', 'ROLE_HEAD_OF_DEPT'].forEach((r) => {
        if (!has(r, 'VIEW')) set(r, 'VIEW', true);
      });
    }
  });

  resources.forEach((res) => {
    if (res.id !== 'RES_MAPPING_DM') return;
    roles.forEach((role) => {
      const dmView = Boolean(matrix[role.id]?.RES_DANH_MUC_NOI_BO?.VIEW);
      matrix[role.id] = matrix[role.id] || {};
      matrix[role.id].RES_MAPPING_DM = { ...(matrix[role.id].RES_MAPPING_DM || {}), VIEW: dmView };
    });
  });

  return matrix;
};

const moToanQuyenAdmin = (matrix, resources) => {
  const nextMatrix = { ...(matrix || {}) };
  nextMatrix.ROLE_ADMIN = { ...(nextMatrix.ROLE_ADMIN || {}) };
  (resources || []).forEach((res) => {
    nextMatrix.ROLE_ADMIN[res.id] = { ...(nextMatrix.ROLE_ADMIN[res.id] || {}) };
    uniq(['VIEW', ...(res.actions || [])]).forEach((action) => {
      nextMatrix.ROLE_ADMIN[res.id][action] = true;
    });
  });
  return nextMatrix;
};

const resolveRoleHierarchy = (roleIds, roles) => {
  const roleMap = new Map((roles || []).map((r) => [r.id, r]));
  const visited = new Set();
  const stack = [...uniq(roleIds)];

  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur || visited.has(cur)) continue;
    visited.add(cur);
    const role = roleMap.get(cur);
    if (!role) continue;
    (role.inherits || []).forEach((parent) => {
      if (!visited.has(parent)) stack.push(parent);
    });
  }

  return Array.from(visited);
};

export const taoPermissionKey = (resourceId, action) => `${String(resourceId || '').trim()}::${String(action || '').toUpperCase().trim()}`;

export const parsePermissionKey = (key) => {
  const [resourceId = '', action = ''] = String(key || '').split('::');
  return { resourceId, action: action.toUpperCase() };
};

export const taiRBAC = async () => {
  const [rawResources, rawRoles, rawGroups, rawMatrix, rawBindings] = await Promise.all([
    docStorage(RBAC_KEYS.RESOURCES),
    docStorage(RBAC_KEYS.ROLES),
    docStorage(RBAC_KEYS.GROUPS),
    docStorage(RBAC_KEYS.MATRIX),
    docStorage(RBAC_KEYS.USER_BINDINGS),
  ]);

  const resources = mergeDefaults(jsonArray(rawResources), DEFAULT_RESOURCES, 'id', chuanHoaResource)
    .filter((x) => x.id && x.name)
    .map((x) => ({ ...x, actions: uniq(x.actions.length > 0 ? x.actions : ['VIEW']) }));

  const roles = mergeDefaults(jsonArray(rawRoles), DEFAULT_ROLES, 'id', chuanHoaRole)
    .filter((x) => x.id && x.name);

  const groups = mergeDefaults(jsonArray(rawGroups), DEFAULT_GROUPS, 'id', chuanHoaGroup)
    .filter((x) => x.id && x.name);

  const defaultMatrix = taoMatrixMacDinh(roles, resources);
  const savedMatrix = jsonObject(rawMatrix);
  const matrix = {};

  roles.forEach((role) => {
    matrix[role.id] = matrix[role.id] || {};
    resources.forEach((res) => {
      const defaults = defaultMatrix?.[role.id]?.[res.id] || {};
      const savedActions = savedMatrix?.[role.id]?.[res.id] || {};
      matrix[role.id][res.id] = {};
      uniq(['VIEW', ...res.actions]).forEach((action) => {
        matrix[role.id][res.id][action] = Boolean(
          Object.prototype.hasOwnProperty.call(savedActions, action) ? savedActions[action] : defaults[action]
        );
      });
    });
  });

  const matrixAdmin = moToanQuyenAdmin(matrix, resources);

  const savedBindings = jsonObject(rawBindings);
  const userBindings = {};
  Object.keys(savedBindings).forEach((email) => {
    userBindings[String(email).trim().toLowerCase()] = chuanHoaBinding(savedBindings[email]);
  });

  return { resources, roles, groups, matrix: matrixAdmin, userBindings };
};

export const luuRBAC = async (cfg) => {
  const userBindings = {};
  Object.entries(cfg?.userBindings || {}).forEach(([email, binding]) => {
    const emailChuan = String(email || '').trim().toLowerCase();
    if (!emailChuan) return;
    userBindings[emailChuan] = chuanHoaBinding(binding);
  });

  const payload = {
    resources: mergeDefaults(cfg?.resources || [], DEFAULT_RESOURCES, 'id', chuanHoaResource)
      .filter((x) => x.id && x.name),
    roles: mergeDefaults(cfg?.roles || [], DEFAULT_ROLES, 'id', chuanHoaRole)
      .filter((x) => x.id && x.name),
    groups: mergeDefaults(cfg?.groups || [], DEFAULT_GROUPS, 'id', chuanHoaGroup)
      .filter((x) => x.id && x.name),
    matrix: {},
    userBindings,
  };

  payload.matrix = moToanQuyenAdmin(cfg?.matrix || {}, payload.resources);

  await Promise.all([
    ghiStorage(RBAC_KEYS.RESOURCES, JSON.stringify(payload.resources)),
    ghiStorage(RBAC_KEYS.ROLES, JSON.stringify(payload.roles)),
    ghiStorage(RBAC_KEYS.GROUPS, JSON.stringify(payload.groups)),
    ghiStorage(RBAC_KEYS.MATRIX, JSON.stringify(payload.matrix || {})),
    ghiStorage(RBAC_KEYS.USER_BINDINGS, JSON.stringify(payload.userBindings || {})),
  ]);

  return taiRBAC();
};

const layBindingNguoiDung = (cfg, email, fallbackRole = 'USER') => {
  const emailChuan = String(email || '').trim().toLowerCase();
  const binding = cfg?.userBindings?.[emailChuan];
  if (binding) return chuanHoaBinding(binding);

  if (String(fallbackRole || '').toUpperCase() === 'ADMIN') {
    return chuanHoaBinding({ roleIds: ['ROLE_ADMIN'], groupIds: [], overrides: { allow: [], deny: [] }, dataScope: 'ALL' });
  }

  return taoBindingRong();
};

const layRoleIdsHieuLuc = (cfg, email, fallbackRole = 'USER') => {
  const binding = layBindingNguoiDung(cfg, email, fallbackRole);
  return resolveRoleHierarchy(binding.roleIds, cfg?.roles || []);
};

const layDataScopeHieuLuc = (cfg, roleIds, binding) => {
  const rank = { SELF: 1, GROUP: 2, ALL: 3 };
  const roleMap = new Map((cfg?.roles || []).map((r) => [r.id, r]));
  let scope = 'SELF';
  roleIds.forEach((roleId) => {
    const s = String(roleMap.get(roleId)?.dataScope || 'SELF').toUpperCase();
    if (rank[s] > rank[scope]) scope = s;
  });
  if (binding?.dataScope && rank[binding.dataScope] > rank[scope]) {
    scope = binding.dataScope;
  }
  return scope;
};

export const kiemTraQuyen = ({ cfg, email, fallbackRole = 'USER', resourceId, action = 'VIEW' }) => {
  if (!cfg || !resourceId) return { granted: false, dataScope: 'SELF', by: 'NONE' };

  const binding = layBindingNguoiDung(cfg, email, fallbackRole);
  const roleIds = resolveRoleHierarchy(binding.roleIds, cfg.roles);
  const actionUpper = String(action || 'VIEW').toUpperCase();
  const key = taoPermissionKey(resourceId, actionUpper);

  if (binding.overrides.deny.includes(key)) {
    return { granted: false, dataScope: layDataScopeHieuLuc(cfg, roleIds, binding), by: 'OVERRIDE_DENY' };
  }
  if (binding.overrides.allow.includes(key)) {
    return { granted: true, dataScope: layDataScopeHieuLuc(cfg, roleIds, binding), by: 'OVERRIDE_ALLOW' };
  }

  const grantedByRole = roleIds.some((roleId) => Boolean(cfg?.matrix?.[roleId]?.[resourceId]?.[actionUpper]));
  return {
    granted: grantedByRole,
    dataScope: layDataScopeHieuLuc(cfg, roleIds, binding),
    by: grantedByRole ? 'ROLE' : 'NONE',
  };
};

export const nguoiDungLaAdminRbac = ({ cfg, email, fallbackRole = 'USER' }) => {
  const roleIds = layRoleIdsHieuLuc(cfg, email, fallbackRole);
  return roleIds.includes('ROLE_ADMIN');
};

export const layVaiTroPhienHieuLuc = ({ cfg, email, fallbackRole = 'USER' }) => {
  return nguoiDungLaAdminRbac({ cfg, email, fallbackRole }) ? 'ADMIN' : 'USER';
};

export const locModuleTheoRBAC = ({ cfg, email, fallbackRole = 'USER', modules = [] }) => {
  return (modules || []).filter((mod) => {
    const resource = (cfg?.resources || []).find((r) => r.moduleId === mod.id);
    if (!resource) {
      return mod.adminOnly ? nguoiDungLaAdminRbac({ cfg, email, fallbackRole }) : true;
    }
    return kiemTraQuyen({ cfg, email, fallbackRole, resourceId: resource.id, action: 'VIEW' }).granted;
  });
};

export const timResourceTheoRoute = (cfg, routeName) => {
  const route = String(routeName || '').trim();
  if (!route) return null;
  return (cfg?.resources || []).find((r) => r.route === route) || null;
};

export const coQuyenManHinh = ({ cfg, email, fallbackRole = 'USER', routeName }) => {
  const resource = timResourceTheoRoute(cfg, routeName);
  if (!resource) return true;
  return kiemTraQuyen({ cfg, email, fallbackRole, resourceId: resource.id, action: 'VIEW' }).granted;
};

export const dongBoLegacyAclTheoRBAC = async ({ cfg, email, fallbackRole = 'USER' }) => {
  const emailChuan = String(email || '').trim().toLowerCase();
  if (!emailChuan) return [];
  if (!cfg) {
    await xoaStorage(`ACL_USER_${emailChuan}`);
    return [];
  }

  const binding = layBindingNguoiDung(cfg, emailChuan, fallbackRole);
  const roleIds = resolveRoleHierarchy(binding.roleIds, cfg.roles);
  const laAdmin = roleIds.includes('ROLE_ADMIN');

  const ds = (cfg?.resources || [])
    .filter((r) => r.moduleId)
    .map((r) => ({
      id: r.moduleId,
      ten: r.name,
      quyen: laAdmin || kiemTraQuyen({ cfg, email: emailChuan, fallbackRole, resourceId: r.id, action: 'VIEW' }).granted,
    }));

  await ghiStorage(`ACL_USER_${emailChuan}`, JSON.stringify(ds));
  return ds;
};

export const thongTinKiemTraApi = ({ cfg, email, fallbackRole = 'USER', resourceId, action }) => {
  const verdict = kiemTraQuyen({ cfg, email, fallbackRole, resourceId, action });
  return {
    x_rbac_email: String(email || '').trim().toLowerCase(),
    x_rbac_resource: String(resourceId || '').trim(),
    x_rbac_action: String(action || 'VIEW').toUpperCase(),
    x_rbac_scope: verdict.dataScope,
    x_rbac_allow: verdict.granted ? '1' : '0',
  };
};
