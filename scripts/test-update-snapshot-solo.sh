#!/bin/bash

RED='\033[1;31m'
YELLOW='\033[1;33m'
GREEN='\033[1;32;1m'
CORNBLUE="\033[1;3;38;5;69m"
NC='\033[0m' # No color

echo -e "${GREEN}\nGotcha. Looking for test files matching \"$1\" in the client${NC}\n"
TEST_COMMAND="test-client:update-snapshot:one" TEST_FILE=$1 docker-compose -f docker-compose-test-solo.yml up --abort-on-container-exit