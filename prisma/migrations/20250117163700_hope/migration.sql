-- CreateTable
CREATE TABLE `attrezzatura` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `numero_sala` VARCHAR(10) NOT NULL,
    `stato` VARCHAR(20) NOT NULL,
    `ultima_manutenzione` DATE NULL,
    `prossima_manutenzione` DATE NULL,

    INDEX `Attrezzatura_numero_sala_fkey`(`numero_sala`),
    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendario_disponibilita` (
    `id` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `data` DATE NOT NULL,
    `ora_inizio` TIME(0) NOT NULL,
    `ora_fine` TIME(0) NOT NULL,

    INDEX `Calendario_Disponibilita_CF_medico_fkey`(`CF_medico`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartella_clinica` (
    `id` VARCHAR(20) NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `data_apertura` DATE NOT NULL,
    `data_chiusura` DATE NULL,
    `diagnosi` TEXT NULL,

    INDEX `Cartella_Clinica_CF_paziente_fkey`(`CF_paziente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compagnia` (
    `id_compagnia` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `indirizzo` TEXT NULL,
    `telefono` VARCHAR(20) NULL,

    UNIQUE INDEX `Compagnia_nome_key`(`nome`),
    PRIMARY KEY (`id_compagnia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cura_post_operativa` (
    `id` VARCHAR(20) NOT NULL,
    `id_intervento` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `note` TEXT NOT NULL,
    `parametri_vitali` TEXT NOT NULL,
    `medicazioni` TEXT NULL,
    `terapia` TEXT NULL,
    `complicanze` TEXT NULL,

    INDEX `Cura_Post_Operativa_CF_medico_idx`(`CF_medico`),
    INDEX `Cura_Post_Operativa_id_intervento_idx`(`id_intervento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `esame_pre_operatorio` (
    `id` VARCHAR(20) NOT NULL,
    `id_cartella` VARCHAR(20) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `data` DATE NOT NULL,
    `risultato` TEXT NULL,
    `validita_giorni` INTEGER NOT NULL,

    INDEX `Esame_Pre_Operatorio_id_cartella_fkey`(`id_cartella`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farmaci_intervento` (
    `id_intervento` VARCHAR(20) NOT NULL,
    `codice_farmaco` VARCHAR(20) NOT NULL,
    `quantita` INTEGER NOT NULL,

    INDEX `Farmaci_Intervento_codice_farmaco_fkey`(`codice_farmaco`),
    PRIMARY KEY (`id_intervento`, `codice_farmaco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farmaco` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `dosaggio` VARCHAR(50) NULL,
    `via_somministrazione` VARCHAR(50) NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infermiere` (
    `CF` VARCHAR(16) NOT NULL,
    `reparto` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intervento` (
    `id` VARCHAR(20) NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `codice_tipo` VARCHAR(20) NOT NULL,
    `numero_sala` VARCHAR(10) NOT NULL,
    `data_ora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `durata_prevista` INTEGER NOT NULL,
    `stato` VARCHAR(20) NOT NULL,

    INDEX `Intervento_CF_paziente_fkey`(`CF_paziente`),
    INDEX `Intervento_codice_tipo_fkey`(`codice_tipo`),
    INDEX `Intervento_numero_sala_fkey`(`numero_sala`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medici_intervento` (
    `id_intervento` VARCHAR(20) NOT NULL,
    `CF_medico` VARCHAR(16) NOT NULL,
    `ruolo` VARCHAR(50) NOT NULL,

    INDEX `Medici_Intervento_CF_medico_fkey`(`CF_medico`),
    PRIMARY KEY (`id_intervento`, `CF_medico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medico` (
    `CF` VARCHAR(16) NOT NULL,
    `num_albo` VARCHAR(20) NOT NULL,
    `specializzazione` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Medico_num_albo_key`(`num_albo`),
    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paziente` (
    `CF` VARCHAR(16) NOT NULL,
    `gruppo_sanguigno` VARCHAR(3) NULL,
    `allergie` TEXT NULL,
    `patologie_croniche` TEXT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persona` (
    `CF` VARCHAR(16) NOT NULL,
    `nome` VARCHAR(50) NOT NULL,
    `cognome` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `password` VARCHAR(100) NULL,

    UNIQUE INDEX `Persona_email_key`(`email`),
    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personale` (
    `CF` VARCHAR(16) NOT NULL,
    `data_assunzione` DATE NOT NULL,
    `qualifica` VARCHAR(50) NOT NULL,
    `livello_accesso` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`CF`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `polizza_assicurativa` (
    `numero` VARCHAR(50) NOT NULL,
    `id_compagnia` INTEGER NOT NULL,
    `CF_paziente` VARCHAR(16) NOT NULL,
    `data_scadenza` DATE NOT NULL,
    `massimale` DECIMAL(10, 2) NULL,

    INDEX `Polizza_Assicurativa_CF_paziente_fkey`(`CF_paziente`),
    INDEX `Polizza_Assicurativa_id_compagnia_fkey`(`id_compagnia`),
    PRIMARY KEY (`numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protocollo_post_operatorio` (
    `codice` VARCHAR(20) NOT NULL,
    `descrizione` TEXT NOT NULL,
    `durata_giorni` INTEGER NOT NULL,
    `istruzioni` TEXT NOT NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sala_operatoria` (
    `numero` VARCHAR(10) NOT NULL,
    `piano` INTEGER NOT NULL,
    `tipo_sala` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_intervento` (
    `codice` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descrizione` TEXT NULL,
    `complessita` INTEGER NOT NULL,
    `durata_standard` INTEGER NOT NULL,

    PRIMARY KEY (`codice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turni_infermiere` (
    `id_turno` VARCHAR(20) NOT NULL,
    `CF_infermiere` VARCHAR(16) NOT NULL,

    INDEX `Turni_Infermiere_CF_infermiere_fkey`(`CF_infermiere`),
    PRIMARY KEY (`id_turno`, `CF_infermiere`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turno` (
    `id` VARCHAR(20) NOT NULL,
    `data` DATE NOT NULL,
    `ora_inizio` TIME(0) NOT NULL,
    `ora_fine` TIME(0) NOT NULL,
    `tipo_turno` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visita_controllo` (
    `id` VARCHAR(20) NOT NULL,
    `id_cartella` VARCHAR(20) NOT NULL,
    `data_ora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipo` VARCHAR(50) NOT NULL,
    `esito` TEXT NULL,

    INDEX `Visita_Controllo_id_cartella_fkey`(`id_cartella`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attrezzatura` ADD CONSTRAINT `Attrezzatura_numero_sala_fkey` FOREIGN KEY (`numero_sala`) REFERENCES `sala_operatoria`(`numero`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendario_disponibilita` ADD CONSTRAINT `Calendario_Disponibilita_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartella_clinica` ADD CONSTRAINT `Cartella_Clinica_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cura_post_operativa` ADD CONSTRAINT `cura_post_operativa_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cura_post_operativa` ADD CONSTRAINT `cura_post_operativa_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `esame_pre_operatorio` ADD CONSTRAINT `Esame_Pre_Operatorio_id_cartella_fkey` FOREIGN KEY (`id_cartella`) REFERENCES `cartella_clinica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farmaci_intervento` ADD CONSTRAINT `Farmaci_Intervento_codice_farmaco_fkey` FOREIGN KEY (`codice_farmaco`) REFERENCES `farmaco`(`codice`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farmaci_intervento` ADD CONSTRAINT `Farmaci_Intervento_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infermiere` ADD CONSTRAINT `Infermiere_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `personale`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervento` ADD CONSTRAINT `Intervento_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervento` ADD CONSTRAINT `Intervento_codice_tipo_fkey` FOREIGN KEY (`codice_tipo`) REFERENCES `tipo_intervento`(`codice`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervento` ADD CONSTRAINT `Intervento_numero_sala_fkey` FOREIGN KEY (`numero_sala`) REFERENCES `sala_operatoria`(`numero`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medici_intervento` ADD CONSTRAINT `Medici_Intervento_CF_medico_fkey` FOREIGN KEY (`CF_medico`) REFERENCES `medico`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medici_intervento` ADD CONSTRAINT `Medici_Intervento_id_intervento_fkey` FOREIGN KEY (`id_intervento`) REFERENCES `intervento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medico` ADD CONSTRAINT `Medico_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `personale`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paziente` ADD CONSTRAINT `Paziente_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `persona`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personale` ADD CONSTRAINT `Personale_CF_fkey` FOREIGN KEY (`CF`) REFERENCES `persona`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `polizza_assicurativa` ADD CONSTRAINT `Polizza_Assicurativa_CF_paziente_fkey` FOREIGN KEY (`CF_paziente`) REFERENCES `paziente`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `polizza_assicurativa` ADD CONSTRAINT `Polizza_Assicurativa_id_compagnia_fkey` FOREIGN KEY (`id_compagnia`) REFERENCES `compagnia`(`id_compagnia`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turni_infermiere` ADD CONSTRAINT `Turni_Infermiere_CF_infermiere_fkey` FOREIGN KEY (`CF_infermiere`) REFERENCES `infermiere`(`CF`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turni_infermiere` ADD CONSTRAINT `Turni_Infermiere_id_turno_fkey` FOREIGN KEY (`id_turno`) REFERENCES `turno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_controllo` ADD CONSTRAINT `Visita_Controllo_id_cartella_fkey` FOREIGN KEY (`id_cartella`) REFERENCES `cartella_clinica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
