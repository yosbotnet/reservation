# Istruzioni per l'Avvio del Sistema di Prenotazione Chirurgica

## Requisiti di Sistema

Prima di avviare l'applicazione, assicurarsi di avere installato:

- **Node.js** (versione 18 o superiore)
  - Per verificare: aprire il terminale e digitare `node --version`
  - Se non installato, scaricarlo da [nodejs.org](https://nodejs.org/)

- **PostgreSQL** (versione 14 o superiore)
  - Il database deve essere già configurato e in esecuzione
  - Assicurarsi di avere le credenziali di accesso

## Configurazione

1. **File di Configurazione**
   - Nella cartella principale del progetto, creare un file `.env` basandosi su `.env.example`
   - Modificare le variabili nel file `.env` con i propri valori:
     ```
     # Backend (.env)
     DATABASE_URL="postgresql://prisma:prism@localhost:6543/postgres?pgbouncer=true"
     PORT=8888
     NODE_ENV=development
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRES_IN=24h
     CORS_ORIGIN=http://localhost:8787
     BCRYPT_SALT_ROUNDS=10

     # Frontend (.env)
     REACT_APP_API_URL="http://localhost:8888"
     ```

2. **Struttura delle Cartelle**
   ```
   progetto/
   ├── backend/
   │   └── build/        # Codice backend compilato
   ├── frontend/
   │   └── build/        # Codice frontend compilato
   ├── .env              # File di configurazione
   ├── start-built.sh    # Script di avvio per Linux/macOS
   └── start-built.bat   # Script di avvio per Windows
   ```

## Avvio dell'Applicazione

### Per Windows:
1. Fare doppio click su `start-built.bat`
   - oppure aprire il terminale ed eseguire `.\start-built.bat`
2. Attendere l'avvio completo del sistema
3. Il browser si aprirà automaticamente su http://localhost:8787

### Per Linux/macOS:
1. Aprire il terminale nella cartella del progetto
2. Rendere lo script eseguibile:
   ```bash
   chmod +x start-built.sh
   ```
3. Eseguire lo script:
   ```bash
   ./start-built.sh
   ```
4. Attendere l'avvio completo del sistema
5. Aprire il browser su http://localhost:8787

## Verifica del Funzionamento

- Frontend disponibile su: http://localhost:8787
- Backend API disponibile su: http://localhost:8888
- Per verificare che tutto funzioni:
  1. Aprire il browser e navigare su http://localhost:8787
  2. Dovrebbe apparire la pagina di login del sistema

## Risoluzione Problemi

### Errori Comuni:

1. **"Node.js non è installato"**
   - Soluzione: Installare Node.js da [nodejs.org](https://nodejs.org/)

2. **"Impossibile connettersi al database"**
   - Verificare che PostgreSQL sia in esecuzione
   - Controllare le credenziali nel file `.env` della backend
   - Verificare che il database esista

3. **"Porta già in uso"**
   - Verificare che le porte 8787 e 8888 non siano già utilizzate
   - Terminare eventuali processi che usano queste porte

### Per Assistenza:

- Controllare i log nella console
- Verificare che tutti i requisiti siano soddisfatti
- Se il problema persiste, contattare il supporto tecnico

## Chiusura dell'Applicazione

### Windows:
- Chiudere la finestra del terminale

### Linux/macOS:
- Premere `Ctrl+C` nel terminale dove è in esecuzione lo script

## Note Aggiuntive

- L'applicazione utilizza le porte 8787 (frontend) e 8888 (backend)
- Assicurarsi che queste porte siano disponibili
- Per motivi di sicurezza, modificare sempre le credenziali di default
- Mantenere aggiornato il sistema operativo e Node.js
