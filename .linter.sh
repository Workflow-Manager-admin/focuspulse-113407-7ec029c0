#!/bin/bash
cd /home/kavia/workspace/code-generation/focuspulse-113407-7ec029c0/focuspulse_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

