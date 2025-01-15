import { PrismaClient } from '@prisma/client';
import { db } from '../config/database';
import { NotFoundError, DatabaseError, ConflictError } from '../utils/errors';
import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateAvailabilityRequest,
  DoctorAvailability,
  DoctorStatistics
} from '../types/doctor';

export class DoctorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createDoctor(data: CreateDoctorRequest): Promise<DoctorResponse> {
    try {
      const doctor = await db.transaction(async (prisma) => {
        // Create Persona first
        await prisma.persona.create({
          data: {
            CF: data.CF,
            nome: data.nome,
            cognome: data.cognome,
            email: data.email,
            telefono: data.telefono
          }
        });

        // Create Personale
        await prisma.personale.create({
          data: {
            CF: data.CF,
            data_assunzione: data.data_assunzione,
            qualifica: data.qualifica,
            livello_accesso: data.livello_accesso
          }
        });

        // Create Medico
        const medico = await prisma.medico.create({
          data: {
            CF: data.CF,
            num_albo: data.num_albo,
            specializzazione: data.specializzazione
          },
          include: {
            personale: {
              include: {
                persona: true
              }
            },
            calendario_disponibilita: true
          }
        });

        return this.mapToDoctorResponse(medico);
      });

      return doctor;
    } catch (error) {
      console.error('Failed to create doctor:', error);
      throw new DatabaseError('Failed to create doctor');
    }
  }

  async getDoctorById(CF: string): Promise<DoctorResponse> {
    try {
      const doctor = await this.prisma.medico.findUnique({
        where: { CF },
        include: {
          personale: {
            include: {
              persona: true
            }
          },
          calendario_disponibilita: true
        }
      });

      if (!doctor) {
        throw new NotFoundError(`Doctor with CF ${CF} not found`);
      }

      return this.mapToDoctorResponse(doctor);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get doctor:', error);
      throw new DatabaseError('Failed to get doctor');
    }
  }

  async getAllDoctors(): Promise<DoctorResponse[]> {
    try {
      const doctors = await this.prisma.medico.findMany({
        include: {
          personale: {
            include: {
              persona: true
            }
          },
          calendario_disponibilita: true
        }
      });

      return doctors.map(this.mapToDoctorResponse);
    } catch (error) {
      console.error('Failed to get doctors:', error);
      throw new DatabaseError('Failed to get doctors');
    }
  }

  async updateDoctor(CF: string, data: UpdateDoctorRequest): Promise<DoctorResponse> {
    try {
      const doctor = await db.transaction(async (prisma) => {
        // Update Persona if needed
        if (data.nome || data.cognome || data.email || data.telefono) {
          await prisma.persona.update({
            where: { CF },
            data: {
              nome: data.nome,
              cognome: data.cognome,
              email: data.email,
              telefono: data.telefono
            }
          });
        }

        // Update Personale if needed
        if (data.data_assunzione || data.qualifica || data.livello_accesso) {
          await prisma.personale.update({
            where: { CF },
            data: {
              data_assunzione: data.data_assunzione,
              qualifica: data.qualifica,
              livello_accesso: data.livello_accesso
            }
          });
        }

        // Update Medico
        const updatedDoctor = await prisma.medico.update({
          where: { CF },
          data: {
            specializzazione: data.specializzazione,
            num_albo: data.num_albo
          },
          include: {
            personale: {
              include: {
                persona: true
              }
            },
            calendario_disponibilita: true
          }
        });

        return this.mapToDoctorResponse(updatedDoctor);
      });

      return doctor;
    } catch (error) {
      console.error('Failed to update doctor:', error);
      throw new DatabaseError('Failed to update doctor');
    }
  }

  async addAvailability(CF: string, data: CreateAvailabilityRequest): Promise<DoctorAvailability> {
    try {
      // Check for existing availability in the same time slot
      const existingAvailability = await this.prisma.calendario_disponibilita.findFirst({
        where: {
          CF_medico: CF,
          data: new Date(data.data),
          OR: [
            {
              AND: [
                { ora_inizio: { lte: new Date(`1970-01-01T${data.ora_inizio}`) } },
                { ora_fine: { gt: new Date(`1970-01-01T${data.ora_inizio}`) } }
              ]
            },
            {
              AND: [
                { ora_inizio: { lt: new Date(`1970-01-01T${data.ora_fine}`) } },
                { ora_fine: { gte: new Date(`1970-01-01T${data.ora_fine}`) } }
              ]
            }
          ]
        }
      });

      if (existingAvailability) {
        throw new ConflictError('Doctor already has availability in this time slot');
      }

      const availability = await this.prisma.calendario_disponibilita.create({
        data: {
          id: crypto.randomUUID(),
          CF_medico: CF,
          data: new Date(data.data),
          ora_inizio: new Date(`1970-01-01T${data.ora_inizio}`),
          ora_fine: new Date(`1970-01-01T${data.ora_fine}`)
        }
      });

      return availability;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('Failed to add availability:', error);
      throw new DatabaseError('Failed to add availability');
    }
  }

  async getDoctorStatistics(CF: string): Promise<DoctorStatistics> {
    try {
      const doctor = await this.prisma.medico.findUnique({
        where: { CF },
        include: {
          personale: {
            include: {
              persona: true
            }
          },
          medici_intervento: {
            include: {
              intervento: true
            }
          }
        }
      });

      if (!doctor) {
        throw new NotFoundError(`Doctor with CF ${CF} not found`);
      }

      const totalSurgeries = doctor.medici_intervento.length;
      const completedSurgeries = doctor.medici_intervento.filter(
        mi => mi.intervento.stato === 'completed'
      ).length;

      return {
        CF_medico: doctor.CF,
        nome: doctor.personale.persona.nome,
        cognome: doctor.personale.persona.cognome,
        num_interventi: totalSurgeries,
        tasso_successo: totalSurgeries > 0 ? (completedSurgeries / totalSurgeries) * 100 : 0,
        specializzazione: doctor.specializzazione
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get doctor statistics:', error);
      throw new DatabaseError('Failed to get doctor statistics');
    }
  }

  private mapToDoctorResponse(doctor: any): DoctorResponse {
    return {
      CF: doctor.CF,
      nome: doctor.personale.persona.nome,
      cognome: doctor.personale.persona.cognome,
      email: doctor.personale.persona.email,
      telefono: doctor.personale.persona.telefono,
      num_albo: doctor.num_albo,
      specializzazione: doctor.specializzazione,
      data_assunzione: doctor.personale.data_assunzione,
      qualifica: doctor.personale.qualifica,
      livello_accesso: doctor.personale.livello_accesso,
      calendario_disponibilita: doctor.calendario_disponibilita
    };
  }
}

// Export a singleton instance
export const doctorService = new DoctorService();