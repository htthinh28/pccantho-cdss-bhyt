import Constants from 'expo-constants';
import { Platform } from 'react-native';

const layExtraExpo = () => (
  Constants.expoConfig?.extra
  || Constants.manifest2?.extra
  || Constants.manifest?.extra
  || {}
);

const layHostMayPhatTrien = () => {
  const hostUri = String(
    Constants.expoConfig?.hostUri
    || Constants.manifest2?.extra?.expoClient?.hostUri
    || Constants.manifest?.debuggerHost
    || ''
  ).trim();

  if (!hostUri) return '';

  const [hostPort] = hostUri.split('/');
  const [host] = hostPort.split(':');
  return String(host || '').trim();
};

/**
 * Trên Android emulator, 127.0.0.1/localhost là loopback của máy ảo — không trỏ tới máy host.
 * Map sang 10.0.2.2 (alias host). Không đổi khi Constants.isDevice === true (máy thật: cần IP LAN trong app.json).
 */
const mayAnhLoopbackAndroidGiaLap = (baseUrl) => {
  const trimmed = String(baseUrl || '').trim().replace(/\/$/, '');
  if (!trimmed || Platform.OS !== 'android') return trimmed;
  if (Constants.isDevice === true) return trimmed;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    const u = new URL(withScheme);
    const host = (u.hostname || '').toLowerCase();
    if (host === '127.0.0.1' || host === 'localhost') {
      u.hostname = '10.0.2.2';
      return u.toString().replace(/\/$/, '');
    }
  } catch {
    /* ignore */
  }
  return trimmed;
};

const goiYThemKhiLoiMangPython = (baseUrl) => {
  const buocChay = 'Trên máy chạy service: npm run py:start (uvicorn cổng 8000, --host 0.0.0.0).';
  const urlStr = String(baseUrl || '');
  if (Platform.OS === 'web') {
    return ` ${buocChay} Nếu trang app là HTTPS mà chỉ gọi được HTTP tới 127.0.0.1, trình duyệt có thể chặn (mixed content) — mở Expo bằng http://localhost:8081.`;
  }
  if (Platform.OS === 'android') {
    if (Constants.isDevice === true && /127\.0\.0\.1|localhost/i.test(urlStr)) {
      return ` ${buocChay} Điện thoại thật không truy cập được 127.0.0.1 trên máy tính: đặt app.json → extra.pythonService.baseUrl = IP LAN (ví dụ http://192.168.1.10:8000).`;
    }
    return ` ${buocChay} Giả lập: 10.0.2.2 trỏ tới máy host; máy thật: dùng IP LAN như trên.`;
  }
  return ` ${buocChay} Nếu Windows Firewall chặn, cho phép Python hoặc cổng 8000.`;
};

const resolvePythonServiceBaseUrl = () => {
  const extra = layExtraExpo();
  const configuredBaseUrl = String(extra?.pythonService?.baseUrl || '').trim();
  let resolved;
  if (configuredBaseUrl) {
    resolved = configuredBaseUrl.replace(/\/$/, '');
  } else {
    const devHost = layHostMayPhatTrien();
    if (devHost) resolved = `http://${devHost}:8000`;
    else if (Platform.OS === 'android') resolved = 'http://10.0.2.2:8000';
    else resolved = 'http://127.0.0.1:8000';
  }
  return mayAnhLoopbackAndroidGiaLap(resolved);
};

const resolvePythonServiceTimeoutMs = () => {
  const extra = layExtraExpo();
  const timeoutMs = Number(extra?.pythonService?.timeoutMs);
  return Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 20000;
};

/** Timeout ngắn hơn cho GET /health (khởi động / warm-up); batch audit vẫn dùng timeoutMs mặc định. */
const resolvePythonHealthTimeoutMs = () => {
  const extra = layExtraExpo();
  const timeoutMs = Number(extra?.pythonService?.healthTimeoutMs);
  return Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12000;
};

const fetchJsonWithTimeout = async (endpoint, options = {}) => {
  const baseUrl = resolvePythonServiceBaseUrl();
  const { timeoutMs: timeoutTuTuyChon, ...fetchOptions } = options;
  const timeoutMs = Number.isFinite(timeoutTuTuyChon) && timeoutTuTuyChon > 0
    ? timeoutTuTuyChon
    : resolvePythonServiceTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: fetchOptions.method || 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
      body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
      signal: controller.signal,
    });

    const rawText = await response.text();
    let data = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }
    }
    if (!response.ok) {
      const message = (typeof data?.detail === 'string' && data.detail)
        || (typeof data?.message === 'string' && data.message)
        || (rawText && rawText.length < 400 ? rawText.trim() : '')
        || `Python service HTTP ${response.status}`;
      throw new Error(String(message));
    }
    return data;
  } catch (err) {
    const name = err?.name || '';
    const msg = String(err?.message || '');
    if (name === 'AbortError' || msg === 'Aborted') {
      throw new Error(`Hết thời gian chờ (${timeoutMs}ms) — ${baseUrl}${endpoint}.${goiYThemKhiLoiMangPython(baseUrl)}`);
    }
    if (err instanceof TypeError && /network|fetch|failed|load/i.test(msg)) {
      throw new Error(`Không kết nối được tới Python (${baseUrl}). Kiểm tra VPN/firewall và địa chỉ trong app.json → extra.pythonService.baseUrl.${goiYThemKhiLoiMangPython(baseUrl)}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const pythonServiceConfig = () => ({
  ...layExtraExpo()?.pythonService,
  baseUrl: resolvePythonServiceBaseUrl(),
  timeoutMs: resolvePythonServiceTimeoutMs(),
  healthTimeoutMs: resolvePythonHealthTimeoutMs(),
});

export const healthCheckPythonService = async (opts = {}) => fetchJsonWithTimeout('/health', {
  timeoutMs: Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0
    ? opts.timeoutMs
    : resolvePythonHealthTimeoutMs(),
});

export const auditClaimsBangPythonService = async ({ claims = [], options = {} } = {}) => {
  return fetchJsonWithTimeout('/api/v1/audit/claims', {
    method: 'POST',
    body: { claims, options },
  });
};