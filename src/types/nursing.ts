import { PersonBase } from './patient';

export interface NurseBase extends PersonBase {
  reparto: string;
  data_assunzione: Date;
  qualifica: string;
  livello_accesso: string;
}

export interface Shift {
  id: string;
  data: Date;
  ora_inizio: Date;
  ora_fine: Date;
  tipo_turno: 'mattina' | 'pomeriggio' | 'notte';
}

export interface NurseShift {
  id_turno: string;
  CF_infermiere: string;
  turno: Shift;
}

export interface CreateNurseRequest extends Omit<NurseBase, 'CF'> {
  CF: string;
}

export interface UpdateNurseRequest extends Partial<NurseBase> {
  CF: string;
}

export interface CreateShiftRequest {
  data: string;
  ora_inizio: string;
  ora_fine: string;
  tipo_turno: 'mattina' | 'pomeriggio' | 'notte';
}

export interface AssignNurseRequest {
  CF_infermiere: string;
}

export interface NurseResponse extends NurseBase {
  turni_infermiere?: NurseShift[];
}

export interface NurseWithSchedule extends NurseResponse {
  turni_infermiere: NurseShift[];
}

export interface NurseAssignment {
  CF_infermiere: string;
  id_turno: string;
}

export interface NursePatientAssignment {
  CF_infermiere: string;
  CF_paziente: string;
  data_inizio: Date;
  data_fine?: Date;
}

export interface ShiftNurseInfo {
  infermiere: {
    CF: string;
    reparto: string;
    personale: {
      persona: {
        nome: string;
        cognome: string;
        email: string;
        telefono?: string;
      };
    };
  };
}

export interface ShiftResponse extends Shift {
  turni_infermiere: {
    CF_infermiere: string;
    infermiere: ShiftNurseInfo['infermiere'];
  }[];
}

export interface NurseWorkload {
  CF_infermiere: string;
  nome: string;
  cognome: string;
  num_pazienti: number;
  ore_settimanali: number;
  turni_notte: number;
}