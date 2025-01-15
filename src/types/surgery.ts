import { DoctorSurgeryRole } from './doctor';

export interface Equipment {
  codice: string;
  nome: string;
  numero_sala: string;
  stato: string;
  ultima_manutenzione?: Date;
  prossima_manutenzione?: Date;
}

export interface OperatingRoom {
  numero: string;
  piano: number;
  tipo_sala: string;
  attrezzatura: Equipment[];
}

export interface SurgeryType {
  codice: string;
  nome: string;
  descrizione?: string;
  complessita: number;
  durata_standard: number;
}

export interface Surgery {
  id: string;
  CF_paziente: string;
  codice_tipo: string;
  numero_sala: string;
  data_ora: Date;
  durata_prevista: number;
  stato: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface DrugAdministration {
  id_intervento: string;
  codice_farmaco: string;
  quantita: number;
}

export interface Drug {
  codice: string;
  nome: string;
  dosaggio?: string;
  via_somministrazione?: string;
}

export interface CreateSurgeryRequest {
  CF_paziente: string;
  codice_tipo: string;
  numero_sala: string;
  data_ora: string;
  durata_prevista: number;
  medici: Array<{
    CF_medico: string;
    ruolo: string;
  }>;
}

export interface UpdateSurgeryRequest {
  stato?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  data_ora?: string;
  numero_sala?: string;
  durata_prevista?: number;
}

export interface SurgeryResponse extends Surgery {
  tipo_intervento: SurgeryType;
  sala_operatoria: OperatingRoom;
  medici_intervento: DoctorSurgeryRole[];
  farmaci_intervento?: Array<DrugAdministration & {
    farmaco: Drug;
  }>;
}

export interface SurgeryStatistics {
  total_surgeries: number;
  average_duration: number;
  duration_accuracy: number;
  room_utilization: {
    room_number: string;
    utilization_rate: number;
  }[];
  surgery_types: {
    type: string;
    count: number;
    success_rate: number;
  }[];
}

export interface DrugAdministrationRequest {
  codice_farmaco: string;
  quantita: number;
}