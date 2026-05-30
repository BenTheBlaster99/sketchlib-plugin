#!/usr/bin/env bash
# Build sketchlib-*.rbz for one-click install (Extensions → Install Extension).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VERSION="${1:-1.0.1-beta}"
OUT_NAME="sketchlib-${VERSION}.rbz"
DIST_DIR="${ROOT}/../dist"
STAGE="$(mktemp -d)"

cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

if [[ ! -f "${ROOT}/ui/dist/app.js" ]]; then
  echo "Missing ui/dist/app.js — run: cd ui && npm run build" >&2
  exit 1
fi

mkdir -p "${STAGE}/sketchlib/ui/dist"
cp "${ROOT}/sketchlib.rb" "${STAGE}/"
cp "${ROOT}/sketchlib/main.rb" "${ROOT}/sketchlib/bridge.rb" "${STAGE}/sketchlib/"
cp -r "${ROOT}/ui/dist/." "${STAGE}/sketchlib/ui/dist/"

mkdir -p "$DIST_DIR"
rm -f "${DIST_DIR}/${OUT_NAME}"
(
  cd "$STAGE"
  zip -rq "${DIST_DIR}/${OUT_NAME}" sketchlib.rb sketchlib
)

echo "Created ${DIST_DIR}/${OUT_NAME}"
ls -lh "${DIST_DIR}/${OUT_NAME}"
