/**
 * Stub cho `expo-constants` khi bundle claim_audit (Node) — cấu hình Python từ biến môi trường.
 * CDSS_PYTHON_BASE_URL (mặc định http://127.0.0.1:8000), CDSS_PYTHON_DISABLED=1 để tắt lớp Python.
 */
const enabled = process.env.CDSS_PYTHON_DISABLED !== '1' && process.env.CDSS_PYTHON_ENABLED !== '0';

module.exports = {
  expoConfig: {
    extra: {
      pythonService: {
        baseUrl: String(process.env.CDSS_PYTHON_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, ''),
        enabled: enabled !== false,
        timeoutMs: Number.parseInt(String(process.env.CDSS_PYTHON_TIMEOUT_MS || '20000'), 10) || 20000,
        healthTimeoutMs: Number.parseInt(String(process.env.CDSS_PYTHON_HEALTH_TIMEOUT_MS || '12000'), 10) || 12000,
      },
    },
  },
  manifest2: null,
  manifest: null,
  isDevice: false,
};
