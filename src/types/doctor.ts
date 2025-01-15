import { PersonBase } from './patient';

export interface DoctorBase extends PersonBase {
  num_albo: string;
  specializzazione: string;
  data_assunzione: Date;
  qualifica: string;
  livello_accesso: string;
}

export interface DoctorAvailability {
  id: string;
  CF_medico: string;
  data: Date;
  ora_inizio: Date;
  ora_fine: Date;
}

export interface CreateDoctorRequest extends Omit<DoctorBase, 'CF'> {
  CF: string;
}

export interface UpdateDoctorRequest extends Partial<DoctorBase> {
  CF: string;
}

export interface CreateAvailabilityRequest {
  CF_medico: string;
  data: string;
  ora_inizio: string;
  ora_fine: string;
}

export interface DoctorResponse extends DoctorBase {
  calendario_disponibilita?: DoctorAvailability[];
}

export interface DoctorWithSchedule extends DoctorResponse {
  calendario_disponibilita: DoctorAvailability[];
}

export interface DoctorSurgeryRole {
  id_intervento: string;
  CF_medico: string;
  ruolo: string;
}

export interface DoctorStatistics {
  CF_medico: string;
  nome: string;
  cognome: string;
  num_interventi: number;
  tasso_successo: number;
  specializzazione: string;
}