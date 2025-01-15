-- Persona entity (base entity for Paziente and Personale)
CREATE TABLE Persona (
   CF VARCHAR(16) PRIMARY KEY,
   nome VARCHAR(50) NOT NULL,
   cognome VARCHAR(50) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   telefono VARCHAR(20)
);

-- Paziente 
CREATE TABLE Paziente (
   CF VARCHAR(16) PRIMARY KEY,
   gruppo_sanguigno VARCHAR(3),
   allergie TEXT,
   patologie_croniche TEXT,
   FOREIGN KEY (CF) REFERENCES Persona(CF)
);

-- Personale (base for Medico and Infermiere)
CREATE TABLE Personale (
   CF VARCHAR(16) PRIMARY KEY,
   data_assunzione DATE NOT NULL,
   qualifica VARCHAR(50) NOT NULL,
   livello_accesso VARCHAR(20) NOT NULL,
   FOREIGN KEY (CF) REFERENCES Persona(CF)
);

-- Medico
CREATE TABLE Medico (
   CF VARCHAR(16) PRIMARY KEY,
   num_albo VARCHAR(20) UNIQUE NOT NULL,
   specializzazione VARCHAR(100) NOT NULL,
   FOREIGN KEY (CF) REFERENCES Personale(CF)
);

-- Infermiere
CREATE TABLE Infermiere (
   CF VARCHAR(16) PRIMARY KEY,
   reparto VARCHAR(50) NOT NULL,
   FOREIGN KEY (CF) REFERENCES Personale(CF)
);

-- Compagnia
CREATE TABLE Compagnia (
   id_compagnia INTEGER PRIMARY KEY,
   nome VARCHAR(100) UNIQUE NOT NULL,
   indirizzo TEXT,
   telefono VARCHAR(20)
);

-- Polizza Assicurativa
CREATE TABLE Polizza_Assicurativa (
   numero VARCHAR(50) PRIMARY KEY,
   id_compagnia INTEGER NOT NULL,
   CF_paziente VARCHAR(16) NOT NULL,
   data_scadenza DATE NOT NULL,
   massimale DECIMAL(10,2),
   FOREIGN KEY (id_compagnia) REFERENCES Compagnia(id_compagnia),
   FOREIGN KEY (CF_paziente) REFERENCES Paziente(CF)
);

-- Cartella Clinica
CREATE TABLE Cartella_Clinica (
   id VARCHAR(20) PRIMARY KEY,
   CF_paziente VARCHAR(16) NOT NULL,
   data_apertura DATE NOT NULL,
   data_chiusura DATE,
   diagnosi TEXT,
   FOREIGN KEY (CF_paziente) REFERENCES Paziente(CF)
);

-- Tipo Intervento
CREATE TABLE Tipo_Intervento (
   codice VARCHAR(20) PRIMARY KEY,
   nome VARCHAR(100) NOT NULL,
   descrizione TEXT,
   complessita INTEGER CHECK (complessita BETWEEN 1 AND 5),
   durata_standard INTEGER NOT NULL -- in minutes
);

-- Sala Operatoria
CREATE TABLE Sala_Operatoria (
   numero VARCHAR(10) PRIMARY KEY,
   piano INTEGER NOT NULL,
   tipo_sala VARCHAR(50) NOT NULL
);

-- Attrezzatura
CREATE TABLE Attrezzatura (
   codice VARCHAR(20) PRIMARY KEY,
   nome VARCHAR(100) NOT NULL,
   numero_sala VARCHAR(10) NOT NULL,
   stato VARCHAR(20) CHECK (stato IN ('Disponibile', 'In Uso', 'In Manutenzione')),
   ultima_manutenzione DATE,
   prossima_manutenzione DATE,
   FOREIGN KEY (numero_sala) REFERENCES Sala_Operatoria(numero)
);

-- Intervento
CREATE TABLE Intervento (
   id VARCHAR(20) PRIMARY KEY,
   CF_paziente VARCHAR(16) NOT NULL,
   codice_tipo VARCHAR(20) NOT NULL,
   numero_sala VARCHAR(10) NOT NULL,
   data_ora TIMESTAMP NOT NULL,
   durata_prevista INTEGER NOT NULL,
   stato VARCHAR(20) CHECK (stato IN ('Programmato', 'In Corso', 'Completato', 'Cancellato')),
   FOREIGN KEY (CF_paziente) REFERENCES Paziente(CF),
   FOREIGN KEY (codice_tipo) REFERENCES Tipo_Intervento(codice),
   FOREIGN KEY (numero_sala) REFERENCES Sala_Operatoria(numero)
);

-- Medici_Intervento (relationship table)
CREATE TABLE Medici_Intervento (
   id_intervento VARCHAR(20),
   CF_medico VARCHAR(16),
   ruolo VARCHAR(50) NOT NULL,
   PRIMARY KEY (id_intervento, CF_medico),
   FOREIGN KEY (id_intervento) REFERENCES Intervento(id),
   FOREIGN KEY (CF_medico) REFERENCES Medico(CF)
);

-- Farmaco
CREATE TABLE Farmaco (
   codice VARCHAR(20) PRIMARY KEY,
   nome VARCHAR(100) NOT NULL,
   dosaggio VARCHAR(50),
   via_somministrazione VARCHAR(50)
);

-- Farmaci_Intervento (relationship table)
CREATE TABLE Farmaci_Intervento (
   id_intervento VARCHAR(20),
   codice_farmaco VARCHAR(20),
   quantita INTEGER NOT NULL,
   PRIMARY KEY (id_intervento, codice_farmaco),
   FOREIGN KEY (id_intervento) REFERENCES Intervento(id),
   FOREIGN KEY (codice_farmaco) REFERENCES Farmaco(codice)
);

-- Protocollo Post Operatorio
CREATE TABLE Protocollo_Post_Operatorio (
   codice VARCHAR(20) PRIMARY KEY,
   descrizione TEXT NOT NULL,
   durata_giorni INTEGER NOT NULL,
   istruzioni TEXT NOT NULL
);

-- Esame Pre Operatorio
CREATE TABLE Esame_Pre_Operatorio (
   id VARCHAR(20) PRIMARY KEY,
   id_cartella VARCHAR(20) NOT NULL,
   tipo VARCHAR(50) NOT NULL,
   data DATE NOT NULL,
   risultato TEXT,
   validita_giorni INTEGER NOT NULL,
   FOREIGN KEY (id_cartella) REFERENCES Cartella_Clinica(id)
);

-- Visita di Controllo
CREATE TABLE Visita_Controllo (
   id VARCHAR(20) PRIMARY KEY,
   id_cartella VARCHAR(20) NOT NULL,
   data_ora TIMESTAMP NOT NULL,
   tipo VARCHAR(50) NOT NULL,
   esito TEXT,
   FOREIGN KEY (id_cartella) REFERENCES Cartella_Clinica(id)
);

-- Turno
CREATE TABLE Turno (
   id VARCHAR(20) PRIMARY KEY,
   data DATE NOT NULL,
   ora_inizio TIME NOT NULL,
   ora_fine TIME NOT NULL,
   tipo_turno VARCHAR(20) CHECK (tipo_turno IN ('Mattina', 'Pomeriggio', 'Notte'))
);

-- Turni_Infermiere (relationship table)
CREATE TABLE Turni_Infermiere (
   id_turno VARCHAR(20),
   CF_infermiere VARCHAR(16),
   PRIMARY KEY (id_turno, CF_infermiere),
   FOREIGN KEY (id_turno) REFERENCES Turno(id),
   FOREIGN KEY (CF_infermiere) REFERENCES Infermiere(CF)
);

-- Calendario Disponibilità
CREATE TABLE Calendario_Disponibilita (
   id VARCHAR(20) PRIMARY KEY,
   CF_medico VARCHAR(16) NOT NULL,
   data DATE NOT NULL,
   ora_inizio TIME NOT NULL,
   ora_fine TIME NOT NULL,
   FOREIGN KEY (CF_medico) REFERENCES Medico(CF)
);