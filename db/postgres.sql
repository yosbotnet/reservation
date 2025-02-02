-- La query su postgres e' molto piu complessa rispetto a quella su MySQL
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

-- Associare dottore alle specializzazioni (usando subquery per gli ID corretti)
INSERT INTO specializzato_in (cf, id_specializzazione) 
VALUES
('BNCLSN84M01Z404C', (SELECT id_specializzazione FROM specializzazione WHERE nome = 'Chirurgia Generale')),
('BNCLSN84M01Z404C', (SELECT id_specializzazione FROM specializzazione WHERE nome = 'Ortopedia'));

-- Orari di lavoro dottore
INSERT INTO orariodilavoro (cf, giornodellaSettimana, orainizio, orafine)
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

-- Associare attrezzature alle sale operatorie (usando subquery per gli ID corretti)
INSERT INTO contiene (id_sala, id_attrezzatura)
VALUES
((SELECT id_sala FROM sala_operativa WHERE nome = 'Sala A'), 
 (SELECT id_attrezzatura FROM attrezzatura WHERE nome = 'Tavolo operatorio')),
((SELECT id_sala FROM sala_operativa WHERE nome = 'Sala A'), 
 (SELECT id_attrezzatura FROM attrezzatura WHERE nome = 'Lampa chirurgica')),
((SELECT id_sala FROM sala_operativa WHERE nome = 'Sala B'), 
 (SELECT id_attrezzatura FROM attrezzatura WHERE nome = 'Defibrillatore'));

-- Inserimento tipo intervento
INSERT INTO tipo_intervento (nome, complessita, durata, costo)
VALUES
('Appendicectomia', 'bassa', 60, 1500),
('Frattura ossea', 'media', 120, 3000),
('Bypass coronarico', 'alta', 240, 8000);

-- Inserimento interventi (usando subquery per gli ID corretti)
INSERT INTO intervento (cf_paziente, cf_dottore, id_tipo, id_sala, dataoranizio, dataorafine, esito)
VALUES
('MGCCOR90T25D325Z', 'BNCLSN84M01Z404C', 
 (SELECT id_tipo FROM tipo_intervento WHERE nome = 'Appendicectomia'),
 (SELECT id_sala FROM sala_operativa WHERE nome = 'Sala A'),
 '2025-02-10 10:00:00', '2025-02-10 11:00:00', 'completato'),
('LPSMRA88S67F205B', 'BNCLSN84M01Z404C', 
 (SELECT id_tipo FROM tipo_intervento WHERE nome = 'Frattura ossea'),
 (SELECT id_sala FROM sala_operativa WHERE nome = 'Sala B'),
 '2025-02-15 14:00:00', '2025-02-15 16:00:00', 'programmato');

-- Inserimento allergie pazienti
INSERT INTO allergia (cf, nomeallergia)
VALUES
('MGCCOR90T25D325Z', 'Pollen'), ('LPSMRA88S67F205B', 'Penicillina');

-- Inserimento farmaci
INSERT INTO farmaco (nome)
VALUES
('Paracetamolo'), ('Ibuprofene'), ('Aspirina');

-- Cura post-operatoria (usando il corretto ID dell'intervento)
INSERT INTO cura_postoperativa (id_intervento, descrizione)
VALUES
((SELECT id_intervento FROM intervento WHERE cf_paziente = 'MGCCOR90T25D325Z' AND dataoranizio = '2025-02-10 10:00:00'), 
 'Riposo e assunzione di farmaci antidolorifici per 5 giorni');

-- Prescrizione farmaci post-operatori (usando subquery per gli ID corretti)
INSERT INTO daprendere (id_cura, id_farmaco, frequenza)
VALUES
((SELECT id_cura FROM cura_postoperativa WHERE id_intervento = 
  (SELECT id_intervento FROM intervento WHERE cf_paziente = 'MGCCOR90T25D325Z' AND dataoranizio = '2025-02-10 10:00:00')),
 (SELECT id_farmaco FROM farmaco WHERE nome = 'Paracetamolo'),
 '1 compressa ogni 6 ore');

-- Inserimento attività da evitare
INSERT INTO attivita (nome)
VALUES
('Attività fisica intensa'), ('Esposizione al sole');

-- Attività da evitare dopo intervento (usando subquery per gli ID corretti)
INSERT INTO daevitare (id_cura, id_attivita, perche)
VALUES
((SELECT id_cura FROM cura_postoperativa WHERE id_intervento = 
  (SELECT id_intervento FROM intervento WHERE cf_paziente = 'MGCCOR90T25D325Z' AND dataoranizio = '2025-02-10 10:00:00')),
 (SELECT id_attivita FROM attivita WHERE nome = 'Attività fisica intensa'),
 'Favorisce il rischio di infezione'),
((SELECT id_cura FROM cura_postoperativa WHERE id_intervento = 
  (SELECT id_intervento FROM intervento WHERE cf_paziente = 'MGCCOR90T25D325Z' AND dataoranizio = '2025-02-10 10:00:00')),
 (SELECT id_attivita FROM attivita WHERE nome = 'Esposizione al sole'),
 'Può compromettere la cicatrizzazione');

-- Inserimento visite
INSERT INTO visita (cf_paziente, cf_dottore, dataora, motivo)
VALUES
('MGCCOR90T25D325Z', 'BNCLSN84M01Z404C', '2025-02-05 10:00:00', 'Visita di controllo post-operatoria');