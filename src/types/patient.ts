export interface PersonBase {
  CF: string;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  password: string;
}

export interface PatientBase extends PersonBase {
  gruppo_sanguigno?: string;
  allergie?: string;
  patologie_croniche?: string;
}

export interface InsurancePolicy {
  numero: string;
  id_compagnia: number;
  CF_paziente: string;
  data_scadenza: Date;
  massimale?: number;
}

export interface MedicalRecord {
  id: string;
  CF_paziente: string;
  data_apertura: Date;
  data_chiusura?: Date;
  diagnosi?: string;
}

export interface PatientWithDetails extends PatientBase {
  cartella_clinica?: MedicalRecord[];
  polizza_assicurativa?: InsurancePolicy[];
}

export interface CreatePatientRequest extends PatientBase {
}

export interface UpdatePatientRequest extends Partial<PatientBase> {
  password?: string;
}

export interface PatientResponse extends PatientBase {
  cartella_clinica?: MedicalRecord[];
  polizza_assicurativa?: InsurancePolicy[];
}