-- CreateTable
CREATE TABLE `Persona` (
    `CF` VARCHAR(16) NOT NULL,
    `nome` VARCHAR(50) NOT NULL,
    `cognome` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,

    UNIQUE INDEX `Persona_email_key`(`email`),
    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paziente` (
    `CF` VARCHAR(16) NOT NULL,
    `gruppo_sanguigno` VARCHAR(3) NULL,
    `allergie` TEXT NULL,
    `patologie_croniche` TEXT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Personale` (
    `CF` VARCHAR(16) NOT NULL,
    `data_assunzione` DATE NOT NULL,
    `qualifica` VARCHAR(50) NOT NULL,
    `livello_accesso` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medico` (
    `CF` VARCHAR(16) NOT NULL,
    `num_albo` VARCHAR(20) NOT NULL,
    `specializzazione` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Medico_num_albo_key`(`num_albo`),
    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Infermiere` (
    `CF` VARCHAR(16) NOT NULL,
    `reparto` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compagnia` (
    `id_compagnia` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `indirizzo` TEXT NULL,
    `telefono` VARCHAR(20) NULL,

    UNIQUE INDEX `Compagnia_nome_key`(`nome`),
    PRIMARY KEY (`id_compagnia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Polizza_Assicurativa` (
    `numero` VARCHAR(50) NOT NULL,
    `id_compagnia` INTEGER NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `data_scadenza` DATE NOT NULL,
    `massimale` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cartella_Clinica` (
    `id` VARCHAR(20) NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `data_apertura` DATE NOT NULL,
    `data_chiusura` DATE NULL,
    `diagnosi` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tipo_Intervento` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descrizione` TEXT NULL,
    `complessita` INTEGER NOT NULL,
    `durata_standard` INTEGER NOT NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sala_Operatoria` (
    `numero` VARCHAR(10) NOT NULL,
    `piano` INTEGER NOT NULL,
    `tipo_sala` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attrezzatura` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `numero_sala` VARCHAR(10) NOT NULL,
    `stato` VARCHAR(20) NOT NULL,
    `ultima_manutenzione` DATE NULL,
    `prossima_manutenzione` DATE NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Intervento` (
    `id` VARCHAR(20) NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `codice_tipo` VARCHAR(20) NOT NULL,
    `numero_sala` VARCHAR(10) NOT NULL,
    `data_ora` TIMESTAMP NOT NULL,
    `durata_prevista` INTEGER NOT NULL,
    `stato` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medici_Intervento` (
    `id_intervento` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `ruolo` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_intervento`, `CF_medico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farmaco` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `dosaggio` VARCHAR(50) NULL,
    `via_somministrazione` VARCHAR(50) NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farmaci_Intervento` (
    `id_intervento` VARCHAR(20) NOT NULL,
    `codice_farmaco` VARCHAR(20) NOT NULL,
    `quantita` INTEGER NOT NULL,

    PRIMARY KEY (`id_intervento`, `codice_farmaco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Protocollo_Post_Operatorio` (
    `codice` VARCHAR(20) NOT NULL,
    `descrizione` TEXT NOT NULL,
    `durata_giorni` INTEGER NOT NULL,
    `istruzioni` TEXT NOT NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Esame_Pre_Operatorio` (
    `id` VARCHAR(20) NOT NULL,
    `id_cartella` VARCHAR(20) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `data` DATE NOT NULL,
    `risultato` TEXT NULL,
    `validita_giorni` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Visita_Controllo` (
    `id` VARCHAR(20) NOT NULL,
    `id_cartella` VARCHAR(20) NOT NULL,
    `data_ora` TIMESTAMP NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `esito` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turno` (
    `id` VARCHAR(20) NOT NULL,
    `data` DATE NOT NULL,
    `ora_inizio` TIME NOT NULL,
    `ora_fine` TIME NOT NULL,
    `tipo_turno` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turni_Infermiere` (
    `id_turno` VARCHAR(20) NOT NULL,
    `CF_infermiere` VARCHAR(16) NOT NULL,

    PRIMARY KEY (`id_turno`, `CF_infermiere`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calendario_Disponibilita` (
    `id` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `data` DATE NOT NULL,
    `ora_inizio` TIME NOT NULL,
    `ora_fine` TIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cura_post_operativa` (
    `id` VARCHAR(20) NOT NULL,
    `id_intervento` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `data` TIMESTAMP NOT NULL,
    `note` TEXT NOT NULL,
    `parametri_vitali` TEXT NOT NULL,
    `medicazioni` TEXT NULL,
    `terapia` TEXT NULL,
    `complicanze` TEXT NULL,

    INDEX `cura_post_operativa_id_intervento_idx`(`id_intervento`),
    INDEX `cura_post_operativa_CF_medico_idx`(`CF_medico`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Paziente` ADD CONSTRAINT `Paziente_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `Persona`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personale` ADD CONSTRAINT `Personale_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `Persona`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medico` ADD CONSTRAINT `Medico_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `Personale`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Infermiere` ADD CONSTRAINT `Infermiere_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `Personale`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Polizza_Assicurativa` ADD CONSTRAINT `Polizza_Assicurativa_id_compagnia_fkey` FOREIGN KEY (`id_compagnia`) REFERENCES `Compagnia`(`id_compagnia`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Polizza_Assicurativa` ADD CONSTRAINT `Polizza_Assicurativa_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `Paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cartella_Clinica` ADD CONSTRAINT `Cartella_Clinica_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `Paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attrezzatura` ADD CONSTRAINT `Attrezzatura_numero_sala_fkey` FOREIGN KEY (`numero_sala`) REFERENCES `Sala_Operatoria`(`numero`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervento` ADD CONSTRAINT `Intervento_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `Paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervento` ADD CONSTRAINT `Intervento_codice_tipo_fkey` FOREIGN KEY (`codice_tipo`) REFERENCES `Tipo_Intervento`(`codice`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervento` ADD CONSTRAINT `Intervento_numero_sala_fkey` FOREIGN KEY (`numero_sala`) REFERENCES `Sala_Operatoria`(`numero`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medici_Intervento` ADD CONSTRAINT `Medici_Intervento_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `Intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medici_Intervento` ADD CONSTRAINT `Medici_Intervento_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `Medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmaci_Intervento` ADD CONSTRAINT `Farmaci_Intervento_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `Intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmaci_Intervento` ADD CONSTRAINT `Farmaci_Intervento_codice_farmaco_fkey` FOREIGN KEY (`codice_farmaco`) REFERENCES `Farmaco`(`codice`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Esame_Pre_Operatorio` ADD CONSTRAINT `Esame_Pre_Operatorio_id_cartella_fkey` FOREIGN KEY (`id_cartella`) REFERENCES `Cartella_Clinica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visita_Controllo` ADD CONSTRAINT `Visita_Controllo_id_cartella_fkey` FOREIGN KEY (`id_cartella`) REFERENCES `Cartella_Clinica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turni_Infermiere` ADD CONSTRAINT `Turni_Infermiere_id_turno_fkey` FOREIGN KEY (`id_turno`) REFERENCES `Turno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turni_Infermiere` ADD CONSTRAINT `Turni_Infermiere_CF_infermiere_fkey` FOREIGN KEY (`CF_infermiere`) REFERENCES `Infermiere`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Calendario_Disponibilita` ADD CONSTRAINT `Calendario_Disponibilita_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `Medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cura_post_operativa` ADD CONSTRAINT `cura_post_operativa_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `Intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cura_post_operativa` ADD CONSTRAINT `cura_post_operativa_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `Medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;
