@echo off
echo 🏥 Avvio del Sistema di Prenotazione Chirurgica...

REM Verifica Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js non è installato. Per favore installare Node.js.
    exit /b 1
)

REM Carica variabili d'ambiente se esiste .env
if exist .env (
    for /f "tokens=*" %%a in (.env) do (
        set %%a
    )
)

REM Avvia il backend
echo 🚀 Avvio del backend...
start /b cmd /c "cd backend\build && node index.js"

REM Attendi che il backend sia pronto
timeout /t 3 /nobreak >nul

REM Avvia il frontend
echo 🚀 Avvio del frontend...
start /b cmd /c "cd frontend\build && npx serve -s . -l 8787"

echo ✅ Sistema avviato!
echo 📱 Frontend: http://localhost:8787
echo 🔌 Backend: http://localhost:8888
echo.
echo Per terminare, chiudere questa finestra.
echo.

REM Mantieni la finestra aperta
pause >nul
