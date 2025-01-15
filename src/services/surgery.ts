import { PrismaClient } from '@prisma/client';
import { db } from '../config/database';
import { NotFoundError, DatabaseError, ConflictError } from '../utils/errors';
import {
  Surgery,
  CreateSurgeryRequest,
  UpdateSurgeryRequest,
  SurgeryResponse,
  DrugAdministrationRequest,
  SurgeryStatistics
} from '../types/surgery';

type SurgeryWithStatus = {
  id: string;
  CF_paziente: string;
  codice_tipo: string;
  numero_sala: string;
  data_ora: Date;
  durata_prevista: number;
  stato: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
};

export class SurgeryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createSurgery(data: CreateSurgeryRequest): Promise<SurgeryResponse> {
    try {
      // Check if operating room is available
      const existingBooking = await this.prisma.intervento.findFirst({
        where: {
          numero_sala: data.numero_sala,
          data_ora: {
            gte: new Date(data.data_ora),
            lt: new Date(new Date(data.data_ora).getTime() + data.durata_prevista * 60000)
          }
        }
      });

      if (existingBooking) {
        throw new ConflictError('Operating room is not available at the specified time');
      }

      // Check if all doctors are available
      for (const doctor of data.medici) {
        const doctorAvailability = await this.prisma.calendario_disponibilita.findFirst({
          where: {
            CF_medico: doctor.CF_medico,
            data: new Date(data.data_ora),
            ora_inizio: {
              lte: new Date(data.data_ora)
            },
            ora_fine: {
              gte: new Date(new Date(data.data_ora).getTime() + data.durata_prevista * 60000)
            }
          }
        });

        if (!doctorAvailability) {
          throw new ConflictError(`Doctor ${doctor.CF_medico} is not available at the specified time`);
        }
      }

      const surgery = await db.transaction(async (prisma) => {
        // Create the surgery
        const intervento = await prisma.intervento.create({
          data: {
            id: crypto.randomUUID(),
            CF_paziente: data.CF_paziente,
            codice_tipo: data.codice_tipo,
            numero_sala: data.numero_sala,
            data_ora: new Date(data.data_ora),
            durata_prevista: data.durata_prevista,
            stato: 'scheduled'
          }
        });

        // Assign doctors
        await prisma.medici_intervento.createMany({
          data: data.medici.map(doctor => ({
            id_intervento: intervento.id,
            CF_medico: doctor.CF_medico,
            ruolo: doctor.ruolo
          }))
        });

        // Fetch complete surgery data
        return await prisma.intervento.findUnique({
          where: { id: intervento.id },
          include: {
            paziente: {
              include: {
                persona: true
              }
            },
            sala_operatoria: true,
            tipo_intervento: true,
            medici_intervento: {
              include: {
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
            },
            farmaci_intervento: {
              include: {
                farmaco: true
              }
            }
          }
        });
      });

      return this.mapToSurgeryResponse(surgery);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('Failed to create surgery:', error);
      throw new DatabaseError('Failed to create surgery');
    }
  }

  async getSurgeryById(id: string): Promise<SurgeryResponse> {
    try {
      const surgery = await this.prisma.intervento.findUnique({
        where: { id },
        include: {
          paziente: {
            include: {
              persona: true
            }
          },
          sala_operatoria: true,
          tipo_intervento: true,
          medici_intervento: {
            include: {
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
          },
          farmaci_intervento: {
            include: {
              farmaco: true
            }
          }
        }
      });

      if (!surgery) {
        throw new NotFoundError(`Surgery with id ${id} not found`);
      }

      return this.mapToSurgeryResponse(surgery);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get surgery:', error);
      throw new DatabaseError('Failed to get surgery');
    }
  }

  async updateSurgeryStatus(id: string, data: UpdateSurgeryRequest): Promise<SurgeryResponse> {
    try {
      const surgery = await this.prisma.intervento.update({
        where: { id },
        data: {
          stato: data.stato,
          data_ora: data.data_ora ? new Date(data.data_ora) : undefined,
          numero_sala: data.numero_sala,
          durata_prevista: data.durata_prevista
        },
        include: {
          paziente: {
            include: {
              persona: true
            }
          },
          sala_operatoria: true,
          tipo_intervento: true,
          medici_intervento: {
            include: {
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
          },
          farmaci_intervento: {
            include: {
              farmaco: true
            }
          }
        }
      });

      return this.mapToSurgeryResponse(surgery);
    } catch (error) {
      console.error('Failed to update surgery status:', error);
      throw new DatabaseError('Failed to update surgery status');
    }
  }

  async administeredDrugs(id: string, drugs: DrugAdministrationRequest[]): Promise<void> {
    try {
      await db.transaction(async (prisma) => {
        // Create drug administration records
        await prisma.farmaci_intervento.createMany({
          data: drugs.map(drug => ({
            id_intervento: id,
            codice_farmaco: drug.codice_farmaco,
            quantita: drug.quantita
          }))
        });

        // Update surgery status
        await prisma.intervento.update({
          where: { id },
          data: { stato: 'in_progress' }
        });
      });
    } catch (error) {
      console.error('Failed to record administered drugs:', error);
      throw new DatabaseError('Failed to record administered drugs');
    }
  }

  async getSurgeryStatistics(): Promise<SurgeryStatistics> {
    try {
      const [
        surgeries,
        roomUtilization,
        surgeryTypes
      ] = await Promise.all([
        // Get all completed surgeries
        this.prisma.intervento.findMany({
          where: { stato: 'completed' }
        }) as Promise<SurgeryWithStatus[]>,
        // Get room utilization
        this.prisma.sala_operatoria.findMany({
          include: {
            intervento: {
              where: {
                data_ora: {
                  gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                }
              }
            }
          }
        }),
        // Get surgery types statistics
        this.prisma.tipo_intervento.findMany({
          include: {
            intervento: true
          }
        })
      ]);

      const totalSurgeries = surgeries.length;
      const averageDuration = surgeries.reduce((acc, curr) => 
        acc + curr.durata_prevista, 0) / totalSurgeries;

      return {
        total_surgeries: totalSurgeries,
        average_duration: averageDuration,
        duration_accuracy: this.calculateDurationAccuracy(surgeries),
        room_utilization: this.calculateRoomUtilization(roomUtilization),
        surgery_types: this.calculateSurgeryTypeStats(surgeryTypes)
      };
    } catch (error) {
      console.error('Failed to get surgery statistics:', error);
      throw new DatabaseError('Failed to get surgery statistics');
    }
  }

  private calculateDurationAccuracy(surgeries: SurgeryWithStatus[]): number {
    const accuracies = surgeries.map(surgery => {
      const actual = surgery.durata_prevista; // Assuming this is updated after surgery
      const estimated = surgery.durata_prevista;
      return Math.abs(1 - actual / estimated);
    });

    return accuracies.reduce((acc, curr) => acc + curr, 0) / accuracies.length;
  }

  private calculateRoomUtilization(rooms: any[]): { room_number: string; utilization_rate: number; }[] {
    const totalMinutes = 90 * 24 * 60; // 90 days in minutes
    return rooms.map(room => ({
      room_number: room.numero,
      utilization_rate: room.intervento.reduce((acc: number, curr: any) => 
        acc + curr.durata_prevista, 0) / totalMinutes
    }));
  }

  private calculateSurgeryTypeStats(types: any[]): { type: string; count: number; success_rate: number; }[] {
    return types.map(type => {
      const totalSurgeries = type.intervento.length;
      const successfulSurgeries = type.intervento.filter(
        (s: any) => s.stato === 'completed'
      ).length;

      return {
        type: type.nome,
        count: totalSurgeries,
        success_rate: totalSurgeries > 0 ? (successfulSurgeries / totalSurgeries) * 100 : 0
      };
    });
  }

  private mapToSurgeryResponse(surgery: any): SurgeryResponse {
    return {
      id: surgery.id,
      CF_paziente: surgery.CF_paziente,
      codice_tipo: surgery.codice_tipo,
      numero_sala: surgery.numero_sala,
      data_ora: surgery.data_ora,
      durata_prevista: surgery.durata_prevista,
      stato: surgery.stato,
      tipo_intervento: surgery.tipo_intervento,
      sala_operatoria: surgery.sala_operatoria,
      medici_intervento: surgery.medici_intervento,
      farmaci_intervento: surgery.farmaci_intervento
    };
  }
}

// Export a singleton instance
export const surgeryService = new SurgeryService();