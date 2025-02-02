# Sistema di Prenotazione Chirurgica

Un sistema completo per la gestione delle prenotazioni chirurgiche, degli appuntamenti e delle risorse della struttura medica.
Premessa: Il sito è già accessibile a clinic.ybaro.it! L'ho messo online siccome il processo di setup può essere pesante.

## Requisiti di Sistema

- Ubuntu Server
- Node.js 18 o superiore
- npm
- PostgreSQL 14 o superiore
- PM2 (verrà installato automaticamente)

## Configurazione dell'Ambiente

1. Clonare il repository:
```bash
git clone [repository-url]
cd reservation
```

2. Configurare le variabili d'ambiente:

Backend (.env):
```bash
cp backend/.env.example backend/.env
```
Modificare `backend/.env` con le credenziali PostgreSQL e altre configurazioni:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-key"
BCRYPT_SALT_ROUNDS="10"
PORT=4000
```

Frontend (.env):
```bash
cp frontend/.env.example frontend/.env
```
Modificare `frontend/.env`:
```
REACT_APP_API_URL="http://your-server:4000"
```

## Configurazione del Database

1. Creare il database PostgreSQL:
```bash
sudo -u postgres psql
CREATE DATABASE your_database_name;
\q
```

2. Importare lo schema iniziale e i dati:
```bash
psql -U your_username -d your_database_name -f db/clinica.sql
psql -U your_username -d your_database_name -f db/fakedata.sql
```

## Installazione e Distribuzione

1. Rendere eseguibile lo script di avvio:
```bash
chmod +x start.sh
```

2. Eseguire lo script di avvio:
```bash
./start.sh
```

Lo script:
- Verificherà i requisiti di sistema
- Installerà le dipendenze per frontend e backend
- Genererà il client Prisma
- Eseguirà le migrazioni del database
- Compilerà sia frontend che backend
- Avvierà i servizi usando PM2
- Configurerà i servizi per il riavvio al reboot del sistema

## Gestione dei Servizi

Il sistema utilizza PM2 per la gestione dei processi. Comandi comuni:

- Controllare lo stato dei servizi: `pm2 status`
- Visualizzare i log: `pm2 logs`
- Fermare tutti i servizi: `pm2 stop all`
- Riavviare tutti i servizi: `pm2 restart all`
- Monitorare le risorse: `pm2 monit`

## Accesso all'Applicazione

Dopo la distribuzione:
- Frontend: `http://your-server:3000`
- Backend API: `http://your-server:4000`

## Funzionalità

- Gestione Utenti (ruoli Admin, Medico, Paziente)
- Programmazione Appuntamenti
- Gestione Interventi Chirurgici
- Gestione Sale Operatorie
- Monitoraggio Attrezzature
- Protocolli di Cura Post-operatoria
- Aggiornamenti in Tempo Reale
- Statistiche Complete

## Architettura

- Frontend: React con Tailwind CSS
- Backend: Node.js con Express
- Database: PostgreSQL con Prisma ORM
- Autenticazione: basata su JWT
- Gestione Processi: PM2

## Note sulla Sicurezza

1. Modificare sempre le credenziali predefinite
2. Utilizzare JWT secret robusti
3. Mantenere i file di ambiente al sicuro
4. Aggiornare regolarmente le dipendenze
5. Monitorare i log PM2 per attività sospette

## Risoluzione Problemi

1. Se i servizi non si avviano:
   - Controllare i log: `pm2 logs`
   - Verificare le variabili d'ambiente
   - Assicurarsi che le porte 3000 e 4000 siano disponibili

2. Problemi di connessione al database:
   - Verificare che PostgreSQL sia in esecuzione: `sudo systemctl status postgresql`
   - Controllare DATABASE_URL in backend/.env
   - Assicurarsi che l'utente del database abbia i permessi corretti

3. Frontend non si connette al backend:
   - Verificare REACT_APP_API_URL in frontend/.env
   - Controllare se il backend è in esecuzione: `pm2 status`
   - Verificare che le impostazioni del firewall permettano le connessioni