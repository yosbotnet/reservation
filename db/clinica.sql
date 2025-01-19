-- Enforce strict SQL mode
SET SQL_MODE = 'STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Create database with proper character set
CREATE DATABASE IF NOT EXISTS surgery_clinic
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE surgery_clinic;

-- Base user table with type discrimination
CREATE TABLE utente (
    cf VARCHAR(16) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    datanascita DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    tipoutente ENUM('admin', 'dottore', 'paziente') NOT NULL
) ENGINE=InnoDB;

-- Patient-specific information
CREATE TABLE paziente (
    cf VARCHAR(16) PRIMARY KEY,
    grupposanguigno ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-') NOT NULL,
    FOREIGN KEY (cf) REFERENCES utente(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Doctor-specific information
CREATE TABLE dottore (
    cf VARCHAR(16) PRIMARY KEY,
    numeroregistrazione VARCHAR(20) NOT NULL UNIQUE,
    dataassunzione DATE NOT NULL,
    iban VARCHAR(34) NOT NULL,
    FOREIGN KEY (cf) REFERENCES utente(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Doctor's working hours - weak entity
CREATE TABLE orariodilavoro (
    cf VARCHAR(16),
    giornodellaSettimana ENUM('lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica') NOT NULL,
    orainizio TIME NOT NULL,
    orafine TIME NOT NULL,
    PRIMARY KEY (cf, giornodellaSettimana, orainizio),
    FOREIGN KEY (cf) REFERENCES dottore(cf)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT valid_hours CHECK (orafine > orainizio)
) ENGINE=InnoDB;

-- Medical specializations
CREATE TABLE specializzazione (
    id_specializzazione INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Junction table for doctor specializations
CREATE TABLE specializzato_in (
    cf VARCHAR(16),
    id_specializzazione INT,
    PRIMARY KEY (cf, id_specializzazione),
    FOREIGN KEY (cf) REFERENCES dottore(cf)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (id_specializzazione) REFERENCES specializzazione(id_specializzazione)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Patient allergies - weak entity
CREATE TABLE allergia (
    id_allergia INT AUTO_INCREMENT,
    cf VARCHAR(16),
    nomeallergia VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_allergia, cf),
    FOREIGN KEY (cf) REFERENCES paziente(cf)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Medical visits
CREATE TABLE visita (
    id_visita INT AUTO_INCREMENT PRIMARY KEY,
    cf_paziente VARCHAR(16) NOT NULL,
    cf_dottore VARCHAR(16) NOT NULL,
    dataora DATETIME NOT NULL,
    motivo TEXT NOT NULL,
    FOREIGN KEY (cf_paziente) REFERENCES paziente(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (cf_dottore) REFERENCES dottore(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Operating rooms
CREATE TABLE sala_operativa (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Medical equipment
CREATE TABLE attrezzatura (
    id_attrezzatura INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Junction table for operating room equipment
CREATE TABLE contiene (
    id_sala INT,
    id_attrezzatura INT,
    PRIMARY KEY (id_sala, id_attrezzatura),
    FOREIGN KEY (id_sala) REFERENCES sala_operativa(id_sala)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_attrezzatura) REFERENCES attrezzatura(id_attrezzatura)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Surgery types
CREATE TABLE tipo_intervento (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    complessita ENUM('bassa', 'media', 'alta') NOT NULL,
    durata INT NOT NULL, -- in minutes
    costo DECIMAL(10,2) NOT NULL,
    CONSTRAINT valid_duration CHECK (durata > 0),
    CONSTRAINT valid_cost CHECK (costo > 0)
) ENGINE=InnoDB;

-- Equipment required for each surgery type
CREATE TABLE richiede_attrezzatura (
    id_tipo INT,
    id_attrezzatura INT,
    PRIMARY KEY (id_tipo, id_attrezzatura),
    FOREIGN KEY (id_tipo) REFERENCES tipo_intervento(id_tipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_attrezzatura) REFERENCES attrezzatura(id_attrezzatura)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Surgical interventions
CREATE TABLE intervento (
    id_intervento INT AUTO_INCREMENT PRIMARY KEY,
    cf_paziente VARCHAR(16) NOT NULL,
    cf_dottore VARCHAR(16) NOT NULL,
    id_tipo INT NOT NULL,
    id_sala INT NOT NULL,
    dataoranizio DATETIME NOT NULL,
    dataorafine DATETIME NOT NULL,
    esito ENUM('programmato', 'in_corso', 'completato', 'annullato') NOT NULL DEFAULT 'programmato',
    FOREIGN KEY (cf_paziente) REFERENCES paziente(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (cf_dottore) REFERENCES dottore(cf)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_tipo) REFERENCES tipo_intervento(id_tipo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_sala) REFERENCES sala_operativa(id_sala)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT valid_intervention_time CHECK (dataorafine > dataoranizio)
) ENGINE=InnoDB;

-- Medications
CREATE TABLE farmaco (
    id_farmaco INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Post-operative care
CREATE TABLE cura_postoperativa (
    id_cura INT AUTO_INCREMENT PRIMARY KEY,
    id_intervento INT NOT NULL,
    descrizione TEXT NOT NULL,
    FOREIGN KEY (id_intervento) REFERENCES intervento(id_intervento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Prescribed medications for post-operative care
CREATE TABLE daprendere (
    id_cura INT,
    id_farmaco INT,
    frequenza VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_cura, id_farmaco),
    FOREIGN KEY (id_cura) REFERENCES cura_postoperativa(id_cura)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (id_farmaco) REFERENCES farmaco(id_farmaco)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Activities to avoid during recovery
CREATE TABLE attivita (
    id_attivita INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Restricted activities for post-operative care
CREATE TABLE daevitare (
    id_cura INT,
    id_attivita INT,
    perche TEXT NOT NULL,
    PRIMARY KEY (id_cura, id_attivita),
    FOREIGN KEY (id_cura) REFERENCES cura_postoperativa(id_cura)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (id_attivita) REFERENCES attivita(id_attivita)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Create necessary indexes for performance
CREATE INDEX idx_utente_tipo ON utente(tipoutente);
CREATE INDEX idx_intervento_data ON intervento(dataoranizio);
CREATE INDEX idx_visita_data ON visita(dataora);
CREATE INDEX idx_orari_giorno ON orariodilavoro(giornodellaSettimana);