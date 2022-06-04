#!/usr/bin/env bash
set -euET -o pipefail 
shopt -s inherit_errexit
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cd "$SCRIPT_DIR"

echo "Starting dockers..."
docker-compose -f ./docker/docker-compose.yml up -d
echo "Waiting for the service to startup..."
./logs.sh | sed '/Thank you for installing Firefly III/ q'
echo "Success!"
echo "Go to http://localhost"
