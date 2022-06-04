#!/usr/bin/env bash
set -euET -o pipefail 
shopt -s inherit_errexit
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cd "$SCRIPT_DIR"

docker-compose -f ./docker/docker-compose.yml logs -f
