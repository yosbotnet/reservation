export interface VitalParameters {
  pressione: string;
  frequenza_cardiaca: number;
  temperatura: number;
  saturazione_ossigeno: number;
}

export interface PostOpCareBase {
  id: string;
  id_intervento: string;
  CF_medico: string;
  data: Date;
  note: string;
  parametri_vitali: VitalParameters;
  medicazioni?: string;
  terapia?: string;
  complicanze?: string;
}

export interface PostOpProtocol {
  codice: string;
  descrizione: string;
  durata_giorni: number;
  istruzioni: string;
}

export interface CreatePostOpCareRequest {
  id_intervento: string;
  CF_medico: string;
  note: string;
  parametri_vitali: VitalParameters;
  medicazioni?: string;
  terapia?: string;
  complicanze?: string;
}

export interface UpdatePostOpCareRequest {
  note?: string;
  parametri_vitali?: Partial<VitalParameters>;
  medicazioni?: string;
  terapia?: string;
  complicanze?: string;
}

export interface PostOpCareResponse extends PostOpCareBase {
  intervento: {
    id: string;
    CF_paziente: string;
    data_ora: Date;
    stato: string;
    paziente: {
      CF: string;
      nome: string;
      cognome: string;
    };
  };
  medico: {
    CF: string;
    nome: string;
    cognome: string;
    specializzazione: string;
  };
}

export interface CreateProtocolRequest {
  descrizione: string;
  durata_giorni: number;
  istruzioni: string;
}

export interface UpdateProtocolRequest {
  descrizione?: string;
  durata_giorni?: number;
  istruzioni?: string;
}

export interface PostOpStatistics {
  total_records: number;
  complications_rate: number;
  average_recovery_time: number;
  vital_trends: {
    date: Date;
    averages: {
      heart_rate: number;
      blood_pressure: string;
      temperature: number;
      oxygen_saturation: number;
    };
  }[];
  common_complications: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}