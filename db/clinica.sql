CREATE DATABASE clinica_chirurgica;
USE clinica_chirurgica;

CREATE TABLE UTENTE (
   id INT PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(50) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   ruolo ENUM('ADMIN', 'DOTTORE', 'PAZIENTE') NOT NULL,
   riferimentoId VARCHAR(16),
   CHECK (username <> ''),
   CHECK (password <> '')
);

CREATE TABLE PAZIENTE (
   codiceFiscale VARCHAR(16) PRIMARY KEY,
   nome VARCHAR(50) NOT NULL,
   cognome VARCHAR(50) NOT NULL,
   dataNascita DATE NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   telefono VARCHAR(20) NOT NULL,
   gruppoSanguigno ENUM('A+','A-','B+','B-','AB+','AB-','0+','0-'),
   allergie TEXT
);

CREATE TABLE DOTTORE (
   numeroRegistrazione VARCHAR(10) PRIMARY KEY,
   nome VARCHAR(50) NOT NULL,
   cognome VARCHAR(50) NOT NULL,
   specializzazioni TEXT NOT NULL
);

CREATE TABLE DISPONIBILITA_SETTIMANALE (
   id INT PRIMARY KEY AUTO_INCREMENT,
   dottoreId VARCHAR(10),
   giorno ENUM('LUN','MAR','MER','GIO','VEN','SAB','DOM') NOT NULL,
   oraInizio TIME NOT NULL,
   oraFine TIME NOT NULL,
   ricorrente BOOLEAN DEFAULT TRUE,
   dataInizio DATE,
   dataFine DATE,
   FOREIGN KEY (dottoreId) REFERENCES DOTTORE(numeroRegistrazione) ON DELETE CASCADE,
   CHECK (oraInizio < oraFine)
);

CREATE TABLE INDISPONIBILITA (
   id INT PRIMARY KEY AUTO_INCREMENT,
   dottoreId VARCHAR(10),
   dataInizio DATETIME NOT NULL,
   dataFine DATETIME NOT NULL,
   motivo VARCHAR(255),
   approvata BOOLEAN DEFAULT FALSE,
   FOREIGN KEY (dottoreId) REFERENCES DOTTORE(numeroRegistrazione) ON DELETE CASCADE,
   CHECK (dataInizio < dataFine)
);

CREATE TABLE SLOT_DISPONIBILE (
   id INT PRIMARY KEY AUTO_INCREMENT,
   dottoreId VARCHAR(10),
   dataOraInizio DATETIME NOT NULL,
   dataOraFine DATETIME NOT NULL,
   prenotabile BOOLEAN DEFAULT TRUE,
   tipo ENUM('VISITA', 'INTERVENTO') NOT NULL,
   FOREIGN KEY (dottoreId) REFERENCES DOTTORE(numeroRegistrazione) ON DELETE CASCADE,
   CHECK (dataOraInizio < dataOraFine)
);

CREATE TABLE TIPO_INTERVENTO (
   id INT PRIMARY KEY AUTO_INCREMENT,
   nome VARCHAR(100) NOT NULL,
   durataStimata INT NOT NULL, -- in minuti
   descrizione TEXT,
   complessita FLOAT NOT NULL CHECK (complessita BETWEEN 1 AND 10)
);

CREATE TABLE SALA_OPERATORIA (
   codice VARCHAR(10) PRIMARY KEY,
   nome VARCHAR(50) NOT NULL,
   attrezzatureFisse TEXT,
   disponibile BOOLEAN DEFAULT TRUE
);

CREATE TABLE ATTREZZATURA (
   codiceInventario VARCHAR(20) PRIMARY KEY,
   nome VARCHAR(100) NOT NULL,
   stato ENUM('DISPONIBILE', 'IN_USO', 'MANUTENZIONE') DEFAULT 'DISPONIBILE',
   ultimaManutenzione DATE
);

CREATE TABLE ATTREZZATURA_TIPO_INTERVENTO (
   tipoInterventoId INT,
   attrezzaturaId VARCHAR(20),
   PRIMARY KEY (tipoInterventoId, attrezzaturaId),
   FOREIGN KEY (tipoInterventoId) REFERENCES TIPO_INTERVENTO(id),
   FOREIGN KEY (attrezzaturaId) REFERENCES ATTREZZATURA(codiceInventario)
);

CREATE TABLE VISITA (
   id INT PRIMARY KEY AUTO_INCREMENT,
   pazienteId VARCHAR(16),
   dottoreId VARCHAR(10),
   slotId INT,
   stato ENUM('RICHIESTA', 'CONFERMATA', 'COMPLETATA', 'CANCELLATA') DEFAULT 'RICHIESTA',
   motivo TEXT,
   diagnosi TEXT,
   FOREIGN KEY (pazienteId) REFERENCES PAZIENTE(codiceFiscale),
   FOREIGN KEY (dottoreId) REFERENCES DOTTORE(numeroRegistrazione),
   FOREIGN KEY (slotId) REFERENCES SLOT_DISPONIBILE(id)
);

CREATE TABLE INTERVENTO (
   id INT PRIMARY KEY AUTO_INCREMENT,
   pazienteId VARCHAR(16),
   dottoreId VARCHAR(10),
   tipoInterventoId INT,
   salaOperatoriaId VARCHAR(10),
   slotId INT,
   stato ENUM('PROGRAMMATO', 'IN_CORSO', 'COMPLETATO', 'CANCELLATO') DEFAULT 'PROGRAMMATO',
   durataEffettiva INT, -- in minuti
   esito TEXT,
   successo BOOLEAN,
   note TEXT,
   FOREIGN KEY (pazienteId) REFERENCES PAZIENTE(codiceFiscale),
   FOREIGN KEY (dottoreId) REFERENCES DOTTORE(numeroRegistrazione),
   FOREIGN KEY (tipoInterventoId) REFERENCES TIPO_INTERVENTO(id),
   FOREIGN KEY (salaOperatoriaId) REFERENCES SALA_OPERATORIA(codice),
   FOREIGN KEY (slotId) REFERENCES SLOT_DISPONIBILE(id)
);

CREATE TABLE CURA_POST (
   id INT PRIMARY KEY AUTO_INCREMENT,
   interventoId INT,
   farmaco VARCHAR(100) NOT NULL,
   dosaggio TEXT NOT NULL,
   istruzioni TEXT,
   dataInizio DATE NOT NULL,
   dataFine DATE NOT NULL,
   FOREIGN KEY (interventoId) REFERENCES INTERVENTO(id) ON DELETE CASCADE,
   CHECK (dataInizio <= dataFine)
);

-- Indici per ottimizzare le query più frequenti
CREATE INDEX idx_slot_data ON SLOT_DISPONIBILE(dataOraInizio);
CREATE INDEX idx_intervento_data ON INTERVENTO(slotId);
CREATE INDEX idx_disponibilita_dottore ON DISPONIBILITA_SETTIMANALE(dottoreId, giorno);