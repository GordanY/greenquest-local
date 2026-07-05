#!/bin/bash

# Run this script to deploy both the backend and frontend server on your LAN

export AI_PROXY_BASE_URL="https://greenquestapi.mlwong3.workers.dev/"


export LOCAL_IP=$(ifconfig | grep -Eo "inet (addr:)?([0-9]*\.){3}[0-9]*"  | grep -Eo "([0-9]*\.){3}[0-9]*" | grep -v "127.0.0.1")
openssl req -x509 -newkey rsa:2048 -keyout frontend/self-signed-ssh-cert/key.pem -out frontend/self-signed-ssh-cert/cert.pem -days 365 -nodes -subj "/CN=${LOCAL_IP}" -addext "subjectAltName = IP:${LOCAL_IP}"

## Start backend server in the background
mkdir logs
cd backend
nohup spacetime start > ../logs/server.log 2>&1 &

## Initialize backend
sleep 2
spacetime publish --delete-data --server local greenquest-db 
sleep 5
spacetime generate --out-dir ~/workspace/greenquest-local/frontend/src/module_bindings --lang typescript
sleep 1
spacetime call greenquest-db add_ai_proxy_url "${AI_PROXY_BASE_URL}" --server local

cd ../frontend
nohup npx vite --host 0.0.0.0 > ../logs/web.log 2>&1 &

echo "Your LAN IP is ${LOCAL_IP}"
echo "Go to Auth0(https://auth0.com/), create a new application, and set up:"
echo "Allowed Callback URL: https://${LOCAL_IP}:3001"
echo "Allowed Logout URL:   https://${LOCAL_IP}:3001"
echo "Allowed Web Origins:  https://${LOCAL_IP}:3001"


spacetime call greenquest-db create_new_user root seed seed --server local
spacetime call greenquest-db activate_admin let-me-in --server local