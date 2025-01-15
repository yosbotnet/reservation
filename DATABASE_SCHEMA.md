# Database Schema Documentation

## Core Entities

### Persona (Base Entity)
```sql
CREATE TABLE persona (
  CF VARCHAR(16) PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20)
);
```
- Primary identifier for all people in the system
- Used by both patients and staff

### Paziente (Patient)
```sql
CREATE TABLE paziente (
  CF VARCHAR(16) PRIMARY KEY,
  gruppo_sanguigno VARCHAR(3),
  allergie TEXT,
  patologie_croniche TEXT,
  FOREIGN KEY (CF) REFERENCES persona(CF)
);
```
- Extends persona with medical information
- One-to-one relationship with persona

### Personale (Staff)
```sql
CREATE TABLE personale (
  CF VARCHAR(16) PRIMARY KEY,
  data_assunzione DATE NOT NULL,
  qualifica VARCHAR(50) NOT NULL,
  livello_accesso VARCHAR(20) NOT NULL,
  FOREIGN KEY (CF) REFERENCES persona(CF)
);
```
- Base table for all staff members
- Extended by medico and infermiere

## Medical Staff

### Medico (Doctor)
```sql
CREATE TABLE medico (
  CF VARCHAR(16) PRIMARY KEY,
  num_albo VARCHAR(20) UNIQUE NOT NULL,
  specializzazione VARCHAR(100) NOT NULL,
  FOREIGN KEY (CF) REFERENCES personale(CF)
);
```
Relationships:
- One-to-one with personale
- One-to-many with calendario_disponibilita
- Many-to-many with intervento through medici_intervento

### Infermiere (Nurse)
```sql
CREATE TABLE infermiere (
  CF VARCHAR(16) PRIMARY KEY,
  reparto VARCHAR(50) NOT NULL,
  FOREIGN KEY (CF) REFERENCES personale(CF)
);
```
Relationships:
- One-to-one with personale
- Many-to-many with turno through turni_infermiere

## Medical Records

### Cartella_Clinica (Medical Record)
```sql
CREATE TABLE cartella_clinica (
  id VARCHAR(20) PRIMARY KEY,
  CF_paziente VARCHAR(16) NOT NULL,
  data_apertura DATE NOT NULL,
  data_chiusura DATE,
  diagnosi TEXT,
  FOREIGN KEY (CF_paziente) REFERENCES paziente(CF)
);
```
Relationships:
- One-to-many with paziente
- One-to-many with esame_pre_operatorio
- One-to-many with visita_controllo

### Intervento (Surgery)
```sql
CREATE TABLE intervento (
  id VARCHAR(20) PRIMARY KEY,
  CF_paziente VARCHAR(16) NOT NULL,
  codice_tipo VARCHAR(20) NOT NULL,
  numero_sala VARCHAR(10) NOT NULL,
  data_ora TIMESTAMP NOT NULL,
  durata_prevista INTEGER NOT NULL,
  stato VARCHAR(20) NOT NULL,
  FOREIGN KEY (CF_paziente) REFERENCES paziente(CF),
  FOREIGN KEY (codice_tipo) REFERENCES tipo_intervento(codice),
  FOREIGN KEY (numero_sala) REFERENCES sala_operatoria(numero)
);
```
Key Relationships:
- Many-to-one with paziente
- Many-to-one with tipo_intervento
- Many-to-one with sala_operatoria
- One-to-many with cura_post_operativa
- Many-to-many with medico through medici_intervento
- Many-to-many with farmaco through farmaci_intervento

## Facility Management

### Sala_Operatoria (Operating Room)
```sql
CREATE TABLE sala_operatoria (
  numero VARCHAR(10) PRIMARY KEY,
  piano INTEGER NOT NULL,
  tipo_sala VARCHAR(50) NOT NULL
);
```
Relationships:
- One-to-many with intervento
- One-to-many with attrezzatura

### Attrezzatura (Equipment)
```sql
CREATE TABLE attrezzatura (
  codice VARCHAR(20) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  numero_sala VARCHAR(10) NOT NULL,
  stato VARCHAR(20) NOT NULL,
  ultima_manutenzione DATE,
  prossima_manutenzione DATE,
  FOREIGN KEY (numero_sala) REFERENCES sala_operatoria(numero)
);
```

## Key Relationships

### Surgery Assignment
```sql
CREATE TABLE medici_intervento (
  id_intervento VARCHAR(20),
  CF_medico VARCHAR(16),
  ruolo VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_intervento, CF_medico),
  FOREIGN KEY (id_intervento) REFERENCES intervento(id),
  FOREIGN KEY (CF_medico) REFERENCES medico(CF)
);
```

### Nurse Shifts
```sql
CREATE TABLE turni_infermiere (
  id_turno VARCHAR(20),
  CF_infermiere VARCHAR(16),
  PRIMARY KEY (id_turno, CF_infermiere),
  FOREIGN KEY (id_turno) REFERENCES turno(id),
  FOREIGN KEY (CF_infermiere) REFERENCES infermiere(CF)
);
```

### Post-operative Care
```sql
CREATE TABLE cura_post_operativa (
  id VARCHAR(20) PRIMARY KEY,
  id_intervento VARCHAR(20) NOT NULL,
  CF_medico VARCHAR(16) NOT NULL,
  data TIMESTAMP NOT NULL,
  note TEXT NOT NULL,
  parametri_vitali TEXT NOT NULL,
  medicazioni TEXT,
  terapia TEXT,
  complicanze TEXT,
  FOREIGN KEY (id_intervento) REFERENCES intervento(id),
  FOREIGN KEY (CF_medico) REFERENCES medico(CF)
);
```

## Indexing Strategy

1. Primary Keys: All tables have indexed primary keys

2. Foreign Keys: Indexed for performance
   - CF in paziente and personale
   - CF_paziente in cartella_clinica and intervento
   - numero_sala in intervento and attrezzatura

3. Search Optimization:
   - data_ora in intervento
   - data in turno and calendario_disponibilita
   - stato in intervento

4. Unique Constraints:
   - email in persona
   - num_albo in medico