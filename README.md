# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Hướng dẫn sử dụng hệ thống (tiếng Việt)

- **Đầy đủ theo chức năng:** [`tai_lieu/Huong_dan_su_dung_CDSS_BHYT_20260405.md`](tai_lieu/Huong_dan_su_dung_CDSS_BHYT_20260405.md) (phiên bản 4.0). Đặc tả kỹ thuật: [`tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md`](tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md) (phiên bản 3.0).
- **Người dùng không chuyên CNTT:** [`tai_lieu/Huong_dan_cho_nguoi_khong_chuyen_CNTT.md`](tai_lieu/Huong_dan_cho_nguoi_khong_chuyen_CNTT.md).
- **Kỹ năng giám định AI (chung mọi nhóm rule):** [`tai_lieu/Ky_nang_cot_loi_giam_dinh_AI_BHYT.md`](tai_lieu/Ky_nang_cot_loi_giam_dinh_AI_BHYT.md) · [`tai_lieu/Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md`](tai_lieu/Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md) (bài tập có gợi ý).
- **VTYT — chuẩn hóa suy luận AI:** [`tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md`](tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) · bảng neo [`tai_lieu/Bang_neo_phien_huan_luyen_vtyt_va_engine.md`](tai_lieu/Bang_neo_phien_huan_luyen_vtyt_va_engine.md) · khung phiên [`tai_lieu/Huan_luyen_phien_VTYT_du_phong_Cursor.md`](tai_lieu/Huan_luyen_phien_VTYT_du_phong_Cursor.md) (chưa có audit fixture trong repo).
- **Huấn luyện AI — giám định DVKT (17/VBHN):** [`tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md`](tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md) (chuẩn hóa suy luận) → [`tai_lieu/Huan_luyen_phien_DVKT_VBHN17_Cursor.md`](tai_lieu/Huan_luyen_phien_DVKT_VBHN17_Cursor.md) (mục I: thứ tự ca mẫu).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Firebase cloud persistence (production)

This project now has real Firebase functions for:

- Uploading imported XML documents to Cloud Storage + Firestore metadata
- Syncing DVKT Rule Engine datasets to Firebase
- Restoring DVKT datasets from Firebase back to local storage
- Uploading claim verification results to Firebase

### 1. Fill Firebase config in `app.json`

Update:

```json
"expo": {
  "extra": {
    "firebase": {
      "enabled": true,
      "orgId": "phuongchau",
      "apiKey": "...",
      "authDomain": "...",
      "projectId": "...",
      "storageBucket": "...",
      "messagingSenderId": "...",
      "appId": "..."
    }
  }
}
```

### 2. Use implemented functions

- File: `ma_nguon/tien_ich/firebase_cloud_bhyt.jsx`
- Rule engine sync:
  - `dongBoDuLieuRuleEngineLenFirebase(...)`
  - `taiDuLieuRuleEngineTuFirebase(...)`
- XML upload is called automatically inside `ma_nguon/tien_ich/nhap_file_xml.jsx` when a valid claim is imported.

### 3. Deploy Firestore/Storage security rules in Firebase

Do not use public rules in production. Limit access by authenticated user/org and audit all writes.

Deploy rules:

```bash
npm run firebase:deploy-rules
```

Run local emulators:

```bash
npm run firebase:emulators
```

The rules require Firebase Auth custom claims:

- `org_id`: organization id (must match `orgId` in app config)
- `role`: one of `ADMIN`, `AUDITOR`, `OPERATOR`, `REVIEWER`, `USER`

Example (Node Admin SDK):

```js
await admin.auth().setCustomUserClaims(uid, {
  org_id: 'phuongchau',
  role: 'ADMIN',
});
```

## Python service (hybrid mode)

The app can now run in a hybrid model:

- React Native / Expo keeps the UI and local workflow
- A separate Python FastAPI service handles heavy processing or AI features

Files added for this mode:

- `python_service/app/main.py`
- `python_service/requirements.txt`
- `ma_nguon/dich_vu/python_service_api.jsx`

### 1. Install Python dependencies

```bash
npm run py:install
```

### 2. Start the Python service

```bash
npm run py:start
```

### 2.1. Smoke test the Python service

```bash
npm run qa:python-service
```

Default URL is `http://127.0.0.1:8000`.

The CLI smoke test now verifies three scenarios in one run:

- inpatient exam warnings (`CK_55`, `CK_57`)
- outpatient long-stay warning (`CK_42`)
- day-case duplicate exam warning (`CK_09`)

For Expo native development, the client can auto-resolve the machine IP from Expo host metadata. If you need to pin a fixed URL, update `expo.extra.pythonService.baseUrl` in `app.json`.

### 3. Use the React Native client

Use `ma_nguon/dich_vu/python_service_api.jsx`:

- `healthCheckPythonService()`
- `auditClaimsBangPythonService({ claims, options })`

### 4. Current sample endpoints

- `GET /health`
- `POST /api/v1/audit/claims`

On the dashboard, you can also use the `Smoke test` button in the Python service card to verify that the React Native client can call the service with the same request path used by hybrid audit mode. The card now shows a small PASS/FAIL badge for the latest dashboard smoke test run.

The sample audit endpoint currently returns:

- total claims in batch
- duplicate `MA_LK` inside the payload
- service timestamp

This is a safe scaffold to start moving selected processing from the app into Python without breaking the current local audit flow.

## Offline web export — gói cập nhật delta (nội bộ)

Sau `npm run desktop:export`, thư mục `dist/` là bản web tĩnh có thể đặt trên máy chủ nội bộ (offline). Để **chỉ đóng gói phần thay đổi** so với lần đóng gói trước (và áp lên bản cũ như bản vá):

```bash
npm run desktop:pack:offline-delta
```

- Sinh file zip trong `offline_update_packs/` + cập nhật `scripts/offline_pack_state.json` (snapshot hash từng file).
- Lần đầu (chưa có snapshot): gói **toàn bộ** `dist/`.
- Áp vá lên thư mục `dist` đang chạy: `npm run desktop:apply-offline-update -- --zip ./offline_update_packs/<file>.zip --dist "D:\\path\\to\\dist"`

**Cập nhật tối giản cho bản desktop offline (một file `.exe` chứa sẵn `dist` mới):** `npm run desktop:build-simple-update` → `tai_nguyen/CDSS-BHYT-CapNhat-Offline.exe`. Xem `tai_lieu/HUONG_DAN_NANG_CAP_OFFLINE.txt`.

Bản cài Electron đầy đủ vẫn dùng `npm run release-desktop` / `desktop:build:*`; gói delta phục vụ **triển khai web tĩnh** hoặc bản copy thư mục.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
