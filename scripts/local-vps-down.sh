#!/usr/bin/env bash
# Stop local VPS-parity compose stack (keeps goatcounter-db volume).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-blog}"

docker compose down
echo "stopped (COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}; volume goatcounter-db retained)"
