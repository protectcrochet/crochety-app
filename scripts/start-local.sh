#!/bin/zsh
# CROCHETY - Levanta backend + frontend local, matando fantasmas previos

echo "🧹 Limpiando puertos..."
lsof -nP -tiTCP:3100 -sTCP:LISTEN | xargs kill -9 2>/dev/null
lsof -nP -tiTCP:5273 -sTCP:LISTEN | xargs kill -9 2>/dev/null
sleep 2

echo "🧶 Arrancando backend (3100)..."
cd ~/Desktop/flix/crochety/backend
npm start &
BACKEND_PID=$!

echo "🎨 Arrancando frontend (5273)..."
cd ~/Desktop/flix/crochety/frontend
npm run dev -- --port 5273 --strictPort &
FRONTEND_PID=$!

sleep 8
echo ""
echo "=== VERIFICACIÓN ==="
echo -n "Backend:  "
curl -s -m 5 -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/patrones
echo -n "Frontend: "
curl -s -m 5 -o /dev/null -w "%{http_code}\n" http://localhost:5273/
echo "===================="
echo "👉 Abre http://localhost:5273/ — deja ESTA ventana abierta"
echo "👉 Para detener todo: Ctrl + C"
wait
