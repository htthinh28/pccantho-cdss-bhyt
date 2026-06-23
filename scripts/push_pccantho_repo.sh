#!/usr/bin/env bash
# Đẩy toàn bộ repo lên https://github.com/htthinh28/pccantho-cdss-bhyt
# Yêu cầu: repo trống đã tạo trên GitHub (không README/.gitignore).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REMOTE="${1:-pccantho}"
URL="https://github.com/htthinh28/pccantho-cdss-bhyt"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  git remote add "$REMOTE" "$URL"
fi

push_with_retry() {
  local ref="$1"
  local attempt=1
  local delay=4
  while [ "$attempt" -le 5 ]; do
    if git push -u "$REMOTE" "$ref"; then
      return 0
    fi
    echo "[push_pccantho] Thử lại $ref (lần $attempt) sau ${delay}s..."
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
  return 1
}

echo "[push_pccantho] Kiểm tra repo $URL ..."
if ! git ls-remote "$REMOTE" HEAD >/dev/null 2>&1; then
  echo "[push_pccantho] LỖI: Không truy cập được $URL"
  echo "  → Tạo repo trống tại: https://github.com/new?name=pccantho-cdss-bhyt"
  echo "  → Owner: htthinh28, Public hoặc Private, KHÔNG tick README/license."
  exit 1
fi

echo "[push_pccantho] Đẩy main..."
push_with_retry main

echo "[push_pccantho] Đẩy nhánh tính năng gần đây..."
for b in \
  cursor/cv3231-18-exclude-cong-kham-2583 \
  cursor/ck59-bs-mot-cchn-nhieu-chuyen-khoa-2583; do
  if git show-ref --verify --quiet "refs/heads/$b"; then
    push_with_retry "$b" || echo "[push_pccantho] Bỏ qua $b"
  fi
done

echo "[push_pccantho] Xong. Repo: $URL"
