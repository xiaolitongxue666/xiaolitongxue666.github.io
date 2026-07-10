#!/usr/bin/env bash
# Local VPS-parity stack: ASTRO_BASE=/blog/ + edge :8080 + local GoatCounter.
# Entry: http://127.0.0.1:8080/blog/  ·  http://127.0.0.1:8080/blog/stats/
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-blog}"

EDGE_HOST="${LOCAL_VPS_EDGE_HOST:-127.0.0.1}"
EDGE_PORT="${LOCAL_VPS_EDGE_PORT:-8080}"
EDGE_ORIGIN="http://${EDGE_HOST}:${EDGE_PORT}"
ANALYTICS_ORIGIN="${PUBLIC_ANALYTICS_ORIGIN:-${EDGE_ORIGIN}/analytics}"

resolve_vps_nginx_root() {
  if [[ -n "${VPS_NGINX_ROOT:-}" && -d "${VPS_NGINX_ROOT}/html" ]]; then
    return 0
  fi
  local candidate
  for candidate in \
    "${REPO_ROOT}/../../vps_nginx" \
    "${REPO_ROOT}/../vps_nginx"; do
    if [[ -d "${candidate}/html" ]]; then
      VPS_NGINX_ROOT="${candidate}"
      return 0
    fi
  done
  echo "vps_nginx html/ not found. Set VPS_NGINX_ROOT to the sibling checkout." >&2
  exit 1
}

GC_EMAIL="${LOCAL_GC_EMAIL:-local-dev@example.com}"
GC_PASSWORD="${LOCAL_GC_PASSWORD:-local-dev-only-change-me}"
GC_VHOST="${LOCAL_GC_VHOST:-127.0.0.1}"
ALLOW_EMBED="127.0.0.1,http://127.0.0.1:8080,http://localhost:8080,http://127.0.0.1:4001,http://localhost:4001"

STATIC_DIR="${REPO_ROOT}/deploy/local-edge/static"

sync_theme_static() {
  resolve_vps_nginx_root
  local css_src="${VPS_NGINX_ROOT}/html/css/analytics-blog-theme.css"
  local js_src="${VPS_NGINX_ROOT}/html/js/analytics-theme.js"
  if [[ ! -f "${css_src}" ]]; then
    echo "missing theme CSS: ${css_src}" >&2
    exit 1
  fi
  if [[ ! -f "${js_src}" ]]; then
    echo "missing theme JS: ${js_src}" >&2
    exit 1
  fi
  mkdir -p "${STATIC_DIR}/css" "${STATIC_DIR}/js"
  cp "${css_src}" "${STATIC_DIR}/css/analytics-blog-theme.css"
  cp "${js_src}" "${STATIC_DIR}/js/analytics-theme.js"
  echo "synced theme static from ${VPS_NGINX_ROOT}/html"
}

build_site() {
  echo "building with ASTRO_BASE=/blog/ SITE=${EDGE_ORIGIN} analytics=${ANALYTICS_ORIGIN}"
  ASTRO_BASE=/blog/ \
    ASTRO_SITE="${EDGE_ORIGIN}" \
    PUBLIC_ANALYTICS_ORIGIN="${ANALYTICS_ORIGIN}" \
    npm run build
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}

ensure_gc_volume_writable() {
  # Docker Desktop named volumes are often root-owned; goatcounter runs as uid 1000.
  docker volume create "${COMPOSE_PROJECT_NAME}_goatcounter-db" >/dev/null
  docker run --rm \
    -v "${COMPOSE_PROJECT_NAME}_goatcounter-db:/home/goatcounter/db" \
    alpine chown -R 1000:1000 /home/goatcounter/db
}

compose_up() {
  # Edge talks to blog via compose DNS; host 3001 is only for direct upstream probes.
  if [[ -z "${BLOG_HOST_PORT:-}" ]]; then
    if port_in_use 3001; then
      export BLOG_HOST_PORT=3011
      echo "host :3001 busy; publishing blog on 127.0.0.1:${BLOG_HOST_PORT}"
    else
      export BLOG_HOST_PORT=3001
    fi
  fi
  ensure_gc_volume_writable
  docker compose up -d --force-recreate
}

wait_goatcounter() {
  local i
  for i in $(seq 1 40); do
    if docker compose exec -T goatcounter \
      goatcounter version >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "goatcounter container not ready after 40s" >&2
  return 1
}

site_count() {
  docker compose exec -T goatcounter \
    goatcounter db query -format=csv "select count(*) from sites" 2>/dev/null \
    | awk -F',' 'NR > 1 { gsub(/[[:space:]]/, "", $1); print $1; exit }'
}

init_goatcounter() {
  wait_goatcounter
  docker compose exec -T goatcounter goatcounter db migrate all -createdb

  local count
  count="$(site_count)"
  if [[ -z "${count}" || "${count}" == "0" ]]; then
    echo "creating local GoatCounter site vhost=${GC_VHOST}"
    docker compose exec -T goatcounter \
      goatcounter db create site \
      -vhost="${GC_VHOST}" \
      -user.email="${GC_EMAIL}" \
      -user.password="${GC_PASSWORD}"
  else
    echo "GoatCounter site already present (count=${count})"
  fi

  docker compose exec -T goatcounter goatcounter db query -format=exec \
    "update sites set settings = json_set(json_set(json_set(settings, '\$.public', 'public'), '\$.allow_embed', '${ALLOW_EMBED}'), '\$.allow_counter', json('true')) where site_id = 1;"

  docker compose exec -T goatcounter goatcounter db query -format=exec \
    "update sites set user_defaults = json_set(json_set(json_set(json_set(user_defaults, '\$.language', 'zh-CN'), '\$.theme', ''), '\$.timezone', '.Asia/Shanghai'), '\$.date_format', '2006-01-02') where site_id = 1;"

  docker compose restart goatcounter
  sleep 2
  wait_goatcounter
}

probe() {
  local base="${EDGE_ORIGIN}"
  echo "probing ${base} ..."
  curl --noproxy '*' -sf "${base}/blog/" >/dev/null
  echo "  OK ${base}/blog/"
  curl --noproxy '*' -sf "${base}/analytics/count.js" >/dev/null
  echo "  OK ${base}/analytics/count.js"
  curl --noproxy '*' -sf "${base}/css/analytics-blog-theme.css" >/dev/null
  echo "  OK ${base}/css/analytics-blog-theme.css"
  if curl --noproxy '*' -sL "${base}/blog/stats/" | grep -qE '127\.0\.0\.1:8080/analytics|localhost:8080/analytics'; then
    echo "  OK /blog/stats/ references local analytics"
  else
    echo "warn: /blog/stats/ HTML may not reference local analytics origin" >&2
  fi
}

main() {
  sync_theme_static
  build_site
  compose_up
  init_goatcounter
  probe
  cat <<EOF

Local VPS stack is up (COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}).
  Blog:      ${EDGE_ORIGIN}/blog/
  Stats:     ${EDGE_ORIGIN}/blog/stats/
  Analytics: ${ANALYTICS_ORIGIN}/
  GC login:  ${GC_EMAIL} / (LOCAL_GC_PASSWORD, default local-dev-only-change-me)

Data stays in local Docker volume goatcounter-db (isolated from production).
Stop: npm run local:vps:down   or   bash scripts/local-vps-down.sh
EOF
}

main "$@"
