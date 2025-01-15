import { PrismaClient } from '@prisma/client';
import { db } from '../config/database';
import { NotFoundError, DatabaseError } from '../utils/errors';
import {
  PostOpCareBase,
  CreatePostOpCareRequest,
  UpdatePostOpCareRequest,
  PostOpCareResponse,
  PostOpProtocol,
  CreateProtocolRequest,
  UpdateProtocolRequest,
  PostOpStatistics,
  VitalParameters
} from '../types/postOp';

export class PostOpCareService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createCareRecord(data: CreatePostOpCareRequest): Promise<PostOpCareResponse> {
    try {
      const record = await this.prisma.cura_post_operativa.create({
        data: {
          id: crypto.randomUUID(),
          id_intervento: data.id_intervento,
          CF_medico: data.CF_medico,
          data: new Date(),
          note: data.note,
          parametri_vitali: JSON.stringify(data.parametri_vitali),
          medicazioni: data.medicazioni,
          terapia: data.terapia,
          complicanze: data.complicanze
        },
        include: {
          intervento: {
            include: {
              paziente: {
                include: {
                  persona: true
                }
              }
            }
          },
          medico: {
            include: {
              personale: {
                include: {
                  persona: true
                }
              }
            }
          }
        }
      });

      return this.mapToCareResponse(record);
    } catch (error) {
      console.error('Failed to create post-op care record:', error);
      throw new DatabaseError('Failed to create post-op care record');
    }
  }

  async getCareRecordById(id: string): Promise<PostOpCareResponse> {
    try {
      const record = await this.prisma.cura_post_operativa.findUnique({
        where: { id },
        include: {
          intervento: {
            include: {
              paziente: {
                include: {
                  persona: true
                }
              }
            }
          },
          medico: {
            include: {
              personale: {
                include: {
                  persona: true
                }
              }
            }
          }
        }
      });

      if (!record) {
        throw new NotFoundError(`Post-op care record with id ${id} not found`);
      }

      return this.mapToCareResponse(record);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get post-op care record:', error);
      throw new DatabaseError('Failed to get post-op care record');
    }
  }

  async getCareRecordsByIntervention(interventionId: string): Promise<PostOpCareResponse[]> {
    try {
      const records = await this.prisma.cura_post_operativa.findMany({
        where: { id_intervento: interventionId },
        include: {
          intervento: {
            include: {
              paziente: {
                include: {
                  persona: true
                }
              }
            }
          },
          medico: {
            include: {
              personale: {
                include: {
                  persona: true
                }
              }
            }
          }
        },
        orderBy: {
          data: 'desc'
        }
      });

      return records.map(this.mapToCareResponse);
    } catch (error) {
      console.error('Failed to get post-op care records:', error);
      throw new DatabaseError('Failed to get post-op care records');
    }
  }

  async updateCareRecord(id: string, data: UpdatePostOpCareRequest): Promise<PostOpCareResponse> {
    try {
      const record = await this.prisma.cura_post_operativa.update({
        where: { id },
        data: {
          note: data.note,
          parametri_vitali: data.parametri_vitali ? JSON.stringify(data.parametri_vitali) : undefined,
          medicazioni: data.medicazioni,
          terapia: data.terapia,
          complicanze: data.complicanze
        },
        include: {
          intervento: {
            include: {
              paziente: {
                include: {
                  persona: true
                }
              }
            }
          },
          medico: {
            include: {
              personale: {
                include: {
                  persona: true
                }
              }
            }
          }
        }
      });

      return this.mapToCareResponse(record);
    } catch (error) {
      console.error('Failed to update post-op care record:', error);
      throw new DatabaseError('Failed to update post-op care record');
    }
  }

  async createProtocol(data: CreateProtocolRequest): Promise<PostOpProtocol> {
    try {
      return await this.prisma.protocollo_post_operatorio.create({
        data: {
          codice: crypto.randomUUID(),
          descrizione: data.descrizione,
          durata_giorni: data.durata_giorni,
          istruzioni: data.istruzioni
        }
      });
    } catch (error) {
      console.error('Failed to create post-op protocol:', error);
      throw new DatabaseError('Failed to create post-op protocol');
    }
  }

  async updateProtocol(codice: string, data: UpdateProtocolRequest): Promise<PostOpProtocol> {
    try {
      return await this.prisma.protocollo_post_operatorio.update({
        where: { codice },
        data: {
          descrizione: data.descrizione,
          durata_giorni: data.durata_giorni,
          istruzioni: data.istruzioni
        }
      });
    } catch (error) {
      console.error('Failed to update post-op protocol:', error);
      throw new DatabaseError('Failed to update post-op protocol');
    }
  }

  async getPostOpStatistics(interventionId: string): Promise<PostOpStatistics> {
    try {
      const records = await this.prisma.cura_post_operativa.findMany({
        where: { id_intervento: interventionId },
        orderBy: { data: 'asc' }
      });

      if (records.length === 0) {
        throw new NotFoundError('No post-op care records found for this intervention');
      }

      const vitalTrends = records.map(record => ({
        date: record.data,
        averages: this.calculateVitalAverages(JSON.parse(record.parametri_vitali))
      }));

      const complications = this.analyzeComplications(records);
      const recoveryTime = this.calculateRecoveryTime(records);

      return {
        total_records: records.length,
        complications_rate: (complications.length / records.length) * 100,
        average_recovery_time: recoveryTime,
        vital_trends: vitalTrends,
        common_complications: complications.map(c => ({
          type: c.type,
          count: c.count,
          percentage: (c.count / records.length) * 100
        }))
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get post-op statistics:', error);
      throw new DatabaseError('Failed to get post-op statistics');
    }
  }

  private calculateVitalAverages(vitals: VitalParameters) {
    return {
      heart_rate: vitals.frequenza_cardiaca,
      blood_pressure: vitals.pressione,
      temperature: vitals.temperatura,
      oxygen_saturation: vitals.saturazione_ossigeno
    };
  }

  private analyzeComplications(records: any[]) {
    const complications = new Map<string, number>();
    
    records.forEach(record => {
      if (record.complicanze) {
        const recordComplications = record.complicanze.split(',').map((c: string) => c.trim());
        recordComplications.forEach((complication: string) => {
          complications.set(
            complication,
            (complications.get(complication) || 0) + 1
          );
        });
      }
    });

    return Array.from(complications.entries()).map(([type, count]) => ({
      type,
      count
    }));
  }

  private calculateRecoveryTime(records: any[]): number {
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    
    return Math.ceil(
      (lastRecord.data.getTime() - firstRecord.data.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  }

  private mapToCareResponse(record: any): PostOpCareResponse {
    return {
      id: record.id,
      id_intervento: record.id_intervento,
      CF_medico: record.CF_medico,
      data: record.data,
      note: record.note,
      parametri_vitali: JSON.parse(record.parametri_vitali),
      medicazioni: record.medicazioni,
      terapia: record.terapia,
      complicanze: record.complicanze,
      intervento: {
        id: record.intervento.id,
        CF_paziente: record.intervento.CF_paziente,
        data_ora: record.intervento.data_ora,
        stato: record.intervento.stato,
        paziente: {
          CF: record.intervento.paziente.CF,
          nome: record.intervento.paziente.persona.nome,
          cognome: record.intervento.paziente.persona.cognome
        }
      },
      medico: {
        CF: record.medico.CF,
        nome: record.medico.personale.persona.nome,
        cognome: record.medico.personale.persona.cognome,
        specializzazione: record.medico.specializzazione
      }
    };
  }
}

// Export a singleton instance
export const postOpCareService = new PostOpCareService();