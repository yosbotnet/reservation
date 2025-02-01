-- Inserimento utenti (admin, dottori, pazienti)
INSERT INTO utente (cf, username, password, nome, cognome, datanascita, telefono, tipoutente)
VALUES
('RSSMRA85M01H501Z', 'admin', '$2y$10$vvWa4GxTGWe7Mz0BUtpJ8uf1bAf1.UONOTWoO6D12St2rSLqWOiii', 'Mario', 'Rossi', '1985-01-01', '3331234567', 'admin'),
('BNCLSN84M01Z404C', 'giovanni_dottore', '$2y$10$vvWa4GxTGWe7Mz0BUtpJ8uf1bAf1.UONOTWoO6D12St2rSLqWOiii', 'Giovanni', 'Bianchi', '1984-05-10', '3342345678', 'dottore'),
('MGCCOR90T25D325Z', 'anna_paziente', '$2y$10$vvWa4GxTGWe7Mz0BUtpJ8uf1bAf1.UONOTWoO6D12St2rSLqWOiii', 'Anna', 'Giacconi', '1990-07-15', '3353456789', 'paziente'),
('LPSMRA88S67F205B', 'lucia_paziente', '$2y$10$vvWa4GxTGWe7Mz0BUtpJ8uf1bAf1.UONOTWoO6D12St2rSLqWOiii', 'Lucia', 'Pellegrini', '1988-03-12', '3364567890', 'paziente');

-- Inserimento pazienti con informazioni sanitarie
INSERT INTO paziente (cf, grupposanguigno)
VALUES
('MGCCOR90T25D325Z', 'A+'),
('LPSMRA88S67F205B', 'B-');

-- Inserimento specializzazioni
INSERT INTO specializzazione (nome) 
VALUES
('Chirurgia Generale'),
('Ortopedia'),
('Neurochirurgia'),
('Cardiochirurgia');

-- Inserimento dottori e specializzazioni
INSERT INTO dottore (cf, numeroregistrazione, dataassunzione, iban) 
VALUES
('BNCLSN84M01Z404C', 'D123456789', '2015-03-12', 'IT60X0542811101000000123456');

-- Associare dottore alle specializzazioni
INSERT INTO specializzato_in (cf, id_specializzazione) 
VALUES
('BNCLSN84M01Z404C', 1),
('BNCLSN84M01Z404C', 2);

-- Orari di lavoro dottore
INSERT INTO orariodilavoro (cf, giornodellasettimana, orainizio, orafine)
VALUES
('BNCLSN84M01Z404C', 'lunedi', '09:00:00', '13:00:00'),
('BNCLSN84M01Z404C', 'mercoledi', '14:00:00', '18:00:00'),
('BNCLSN84M01Z404C', 'venerdi', '09:00:00', '13:00:00');

-- Inserimento sale operatorie
INSERT INTO sala_operativa (nome)
VALUES
('Sala A'), ('Sala B');

-- Inserimento attrezzature
INSERT INTO attrezzatura (nome)
VALUES
('Tavolo operatorio'), ('Lampa chirurgica'), ('Defibrillatore');

-- Associare attrezzature alle sale operatorie
INSERT INTO contiene (id_sala, id_attrezzatura)
VALUES
(1, 1), (1, 2), (2, 3);

-- Inserimento tipo intervento
INSERT INTO tipo_intervento (nome, complessita, durata, costo)
VALUES
('Appendicectomia', 'bassa', 60, 1500),
('Frattura ossea', 'media', 120, 3000),
('Bypass coronarico', 'alta', 240, 8000);

-- Inserimento interventi
INSERT INTO intervento (cf_paziente, cf_dottore, id_tipo, id_sala, dataoranizio, dataorafine, esito)
VALUES
('MGCCOR90T25D325Z', 'BNCLSN84M01Z404C', 1, 1, '2025-02-10 10:00:00', '2025-02-10 11:00:00', 'completato'),
('LPSMRA88S67F205B', 'BNCLSN84M01Z404C', 2, 2, '2025-02-15 14:00:00', '2025-02-15 16:00:00', 'programmato');

-- Inserimento allergie pazienti
INSERT INTO allergia (cf, nomeallergia)
VALUES
('MGCCOR90T25D325Z', 'Pollen'), ('LPSMRA88S67F205B', 'Penicillina');

-- Inserimento farmaci
INSERT INTO farmaco (nome)
VALUES
('Paracetamolo'), ('Ibuprofene'), ('Aspirina');

-- Cura post-operatoria
INSERT INTO cura_postoperativa (id_intervento, descrizione)
VALUES
(1, 'Riposo e assunzione di farmaci antidolorifici per 5 giorni');

-- Prescrizione farmaci post-operatori
INSERT INTO daprendere (id_cura, id_farmaco, frequenza)
VALUES
(1, 1, '1 compressa ogni 6 ore');

-- Inserimento attività da evitare
INSERT INTO attivita (nome)
VALUES
('Attività fisica intensa'), ('Esposizione al sole');

-- Attività da evitare dopo intervento
INSERT INTO daevitare (id_cura, id_attivita, perche)
VALUES
(1, 1, 'Favorisce il rischio di infezione'), (1, 2, 'Può compromettere la cicatrizzazione');

-- Inserimento visite
INSERT INTO visita (cf_paziente, cf_dottore, dataora, motivo)
VALUES
('MGCCOR90T25D325Z', 'BNCLSN84M01Z404C', '2025-02-05 10:00:00', 'Visita di controllo post-operatoria');
