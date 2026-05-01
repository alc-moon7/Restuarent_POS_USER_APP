#!/usr/bin/env bash
set -euo pipefail

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"
FLUTTER_HOME="${FLUTTER_HOME:-$HOME/flutter}"

if command -v flutter >/dev/null 2>&1; then
  echo "Using Flutter from $(command -v flutter)"
else
  if [ ! -d "$FLUTTER_HOME/bin" ]; then
    git clone --depth 1 --branch "$FLUTTER_VERSION" \
      https://github.com/flutter/flutter.git "$FLUTTER_HOME"
  fi
  export PATH="$FLUTTER_HOME/bin:$PATH"
fi

flutter --disable-analytics
flutter config --enable-web
flutter pub get
flutter build web --release --base-href "${FLUTTER_BASE_HREF:-/}"
