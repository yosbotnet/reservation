import { PrismaClient } from '@prisma/client';
import { db } from '../config/database';
import { NotFoundError, DatabaseError, ConflictError } from '../utils/errors';
import {
  NurseBase,
  CreateNurseRequest,
  UpdateNurseRequest,
  NurseResponse,
  CreateShiftRequest,
  AssignNurseRequest,
  ShiftResponse,
  NurseWorkload
} from '../types/nursing';

export class NursingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createNurse(data: CreateNurseRequest): Promise<NurseResponse> {
    try {
      const nurse = await db.transaction(async (prisma) => {
        // Create Persona first
        const persona = await prisma.persona.create({
          data: {
            CF: data.CF,
            nome: data.nome,
            cognome: data.cognome,
            email: data.email,
            telefono: data.telefono
          }
        });

        // Create Personale
        const personale = await prisma.personale.create({
          data: {
            CF: data.CF,
            data_assunzione: data.data_assunzione,
            qualifica: data.qualifica,
            livello_accesso: data.livello_accesso
          }
        });

        // Create Infermiere
        const infermiere = await prisma.infermiere.create({
          data: {
            CF: data.CF,
            reparto: data.reparto
          },
          include: {
            personale: {
              include: {
                persona: true
              }
            },
            turni_infermiere: {
              include: {
                turno: true
              }
            }
          }
        });

        return this.mapToNurseResponse(infermiere);
      });

      return nurse;
    } catch (error) {
      console.error('Failed to create nurse:', error);
      throw new DatabaseError('Failed to create nurse');
    }
  }

  async getNurseById(CF: string): Promise<NurseResponse> {
    try {
      const nurse = await this.prisma.infermiere.findUnique({
        where: { CF },
        include: {
          personale: {
            include: {
              persona: true
            }
          },
          turni_infermiere: {
            include: {
              turno: true
            }
          }
        }
      });

      if (!nurse) {
        throw new NotFoundError(`Nurse with CF ${CF} not found`);
      }

      return this.mapToNurseResponse(nurse);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get nurse:', error);
      throw new DatabaseError('Failed to get nurse');
    }
  }

  async updateNurse(CF: string, data: UpdateNurseRequest): Promise<NurseResponse> {
    try {
      const nurse = await db.transaction(async (prisma) => {
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

        // Update Infermiere
        const updatedNurse = await prisma.infermiere.update({
          where: { CF },
          data: {
            reparto: data.reparto
          },
          include: {
            personale: {
              include: {
                persona: true
              }
            },
            turni_infermiere: {
              include: {
                turno: true
              }
            }
          }
        });

        return this.mapToNurseResponse(updatedNurse);
      });

      return nurse;
    } catch (error) {
      console.error('Failed to update nurse:', error);
      throw new DatabaseError('Failed to update nurse');
    }
  }

  async createShift(data: CreateShiftRequest): Promise<ShiftResponse> {
    try {
      // Check for overlapping shifts
      const existingShift = await this.prisma.turno.findFirst({
        where: {
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

      if (existingShift) {
        throw new ConflictError('Overlapping shift exists for this time period');
      }

      const shift = await this.prisma.turno.create({
        data: {
          id: crypto.randomUUID(),
          data: new Date(data.data),
          ora_inizio: new Date(`1970-01-01T${data.ora_inizio}`),
          ora_fine: new Date(`1970-01-01T${data.ora_fine}`),
          tipo_turno: data.tipo_turno
        },
        include: {
          turni_infermiere: {
            include: {
              infermiere: {
                include: {
                  personale: {
                    include: {
                      persona: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return this.mapToShiftResponse(shift);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('Failed to create shift:', error);
      throw new DatabaseError('Failed to create shift');
    }
  }

  async assignNurseToShift(shiftId: string, data: AssignNurseRequest): Promise<ShiftResponse> {
    try {
      // Check if nurse is already assigned to a shift during this time
      const shift = await this.prisma.turno.findUnique({
        where: { id: shiftId }
      });

      if (!shift) {
        throw new NotFoundError(`Shift with id ${shiftId} not found`);
      }

      const existingAssignment = await this.prisma.turni_infermiere.findFirst({
        where: {
          CF_infermiere: data.CF_infermiere,
          turno: {
            data: shift.data,
            OR: [
              {
                AND: [
                  { ora_inizio: { lte: shift.ora_inizio } },
                  { ora_fine: { gt: shift.ora_inizio } }
                ]
              },
              {
                AND: [
                  { ora_inizio: { lt: shift.ora_fine } },
                  { ora_fine: { gte: shift.ora_fine } }
                ]
              }
            ]
          }
        }
      });

      if (existingAssignment) {
        throw new ConflictError('Nurse is already assigned to another shift during this time');
      }

      await this.prisma.turni_infermiere.create({
        data: {
          id_turno: shiftId,
          CF_infermiere: data.CF_infermiere
        }
      });

      const updatedShift = await this.prisma.turno.findUnique({
        where: { id: shiftId },
        include: {
          turni_infermiere: {
            include: {
              infermiere: {
                include: {
                  personale: {
                    include: {
                      persona: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return this.mapToShiftResponse(updatedShift);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('Failed to assign nurse to shift:', error);
      throw new DatabaseError('Failed to assign nurse to shift');
    }
  }

  async getNurseWorkload(CF: string): Promise<NurseWorkload> {
    try {
      const nurse = await this.prisma.infermiere.findUnique({
        where: { CF },
        include: {
          personale: {
            include: {
              persona: true
            }
          },
          turni_infermiere: {
            include: {
              turno: true
            },
            where: {
              turno: {
                data: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            }
          }
        }
      });

      if (!nurse) {
        throw new NotFoundError(`Nurse with CF ${CF} not found`);
      }

      const shifts = nurse.turni_infermiere;
      const nightShifts = shifts.filter(s => s.turno.tipo_turno === 'notte');
      const totalHours = shifts.reduce((acc, s) => {
        const start = s.turno.ora_inizio;
        const end = s.turno.ora_fine;
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

      // Get assigned patients count (assuming from interventions in the last 7 days)
      const assignedPatients = await this.prisma.intervento.count({
        where: {
          data_ora: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          stato: {
            in: ['in_progress', 'completed']
          }
        },
        distinct: ['CF_paziente']
      });

      return {
        CF_infermiere: nurse.CF,
        nome: nurse.personale.persona.nome,
        cognome: nurse.personale.persona.cognome,
        num_pazienti: assignedPatients,
        ore_settimanali: totalHours,
        turni_notte: nightShifts.length
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get nurse workload:', error);
      throw new DatabaseError('Failed to get nurse workload');
    }
  }

  private mapToNurseResponse(nurse: any): NurseResponse {
    return {
      CF: nurse.CF,
      nome: nurse.personale.persona.nome,
      cognome: nurse.personale.persona.cognome,
      email: nurse.personale.persona.email,
      telefono: nurse.personale.persona.telefono,
      reparto: nurse.reparto,
      data_assunzione: nurse.personale.data_assunzione,
      qualifica: nurse.personale.qualifica,
      livello_accesso: nurse.personale.livello_accesso,
      turni_infermiere: nurse.turni_infermiere
    };
  }

  private mapToShiftResponse(shift: any): ShiftResponse {
    return {
      id: shift.id,
      data: shift.data,
      ora_inizio: shift.ora_inizio,
      ora_fine: shift.ora_fine,
      tipo_turno: shift.tipo_turno,
      turni_infermiere: shift.turni_infermiere
    };
  }
}

// Export a singleton instance
export const nursingService = new NursingService();