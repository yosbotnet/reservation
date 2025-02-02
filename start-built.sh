#!/bin/bash

echo "🏥 Avvio del Sistema di Prenotazione Chirurgica..."

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non è installato. Per favore installare Node.js."
    exit 1
fi

# Carica variabili d'ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Avvia il backend
echo "🚀 Avvio del backend..."
cd backend/build && node index.js &
BACKEND_PID=$!

# Attendi che il backend sia pronto
sleep 3

# Avvia il frontend
echo "🚀 Avvio del frontend..."
npx serve -s frontend/build -l 3000 &
FRONTEND_PID=$!

echo "✅ Sistema avviato!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:4000"
echo ""
echo "Per terminare, premere Ctrl+C"

# Gestione della chiusura
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
