import { PrismaClient } from '@prisma/client';
import { db } from '../config/database';
import { NotFoundError, DatabaseError } from '../utils/errors';
import { 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientResponse 
} from '../types/patient';

export class PatientService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createPatient(data: CreatePatientRequest): Promise<PatientResponse> {
    try {
      const patient = await db.transaction(async (prisma) => {
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

        // Then create Paziente
        const paziente = await prisma.paziente.create({
          data: {
            CF: data.CF,
            gruppo_sanguigno: data.gruppo_sanguigno,
            allergie: data.allergie,
            patologie_croniche: data.patologie_croniche,
          },
          include: {
            persona: true,
            cartella_clinica: true,
            polizza_assicurativa: true
          }
        });

        return this.mapToPatientResponse(paziente);
      });

      return patient;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw new DatabaseError('Failed to create patient');
    }
  }

  async getPatientById(CF: string): Promise<PatientResponse> {
    try {
      const patient = await this.prisma.paziente.findUnique({
        where: { CF },
        include: {
          persona: true,
          cartella_clinica: true,
          polizza_assicurativa: true
        }
      });

      if (!patient) {
        throw new NotFoundError(`Patient with CF ${CF} not found`);
      }

      return this.mapToPatientResponse(patient);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Failed to get patient:', error);
      throw new DatabaseError('Failed to get patient');
    }
  }

  async getAllPatients(): Promise<PatientResponse[]> {
    try {
      const patients = await this.prisma.paziente.findMany({
        include: {
          persona: true,
          cartella_clinica: true,
          polizza_assicurativa: true
        }
      });

      return patients.map(this.mapToPatientResponse);
    } catch (error) {
      console.error('Failed to get patients:', error);
      throw new DatabaseError('Failed to get patients');
    }
  }

  async updatePatient(CF: string, data: UpdatePatientRequest): Promise<PatientResponse> {
    try {
      const patient = await db.transaction(async (prisma) => {
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

        // Update Paziente
        const updatedPatient = await prisma.paziente.update({
          where: { CF },
          data: {
            gruppo_sanguigno: data.gruppo_sanguigno,
            allergie: data.allergie,
            patologie_croniche: data.patologie_croniche,
          },
          include: {
            persona: true,
            cartella_clinica: true,
            polizza_assicurativa: true
          }
        });

        return this.mapToPatientResponse(updatedPatient);
      });

      return patient;
    } catch (error) {
      console.error('Failed to update patient:', error);
      throw new DatabaseError('Failed to update patient');
    }
  }

  async deletePatient(CF: string): Promise<void> {
    try {
      await db.transaction(async (prisma) => {
        // Delete Paziente first (this will cascade to related records)
        await prisma.paziente.delete({
          where: { CF }
        });

        // Then delete Persona
        await prisma.persona.delete({
          where: { CF }
        });
      });
    } catch (error) {
      console.error('Failed to delete patient:', error);
      throw new DatabaseError('Failed to delete patient');
    }
  }

  private mapToPatientResponse(patient: any): PatientResponse {
    return {
      CF: patient.CF,
      nome: patient.persona.nome,
      cognome: patient.persona.cognome,
      email: patient.persona.email,
      telefono: patient.persona.telefono,
      gruppo_sanguigno: patient.gruppo_sanguigno,
      allergie: patient.allergie,
      patologie_croniche: patient.patologie_croniche,
      cartella_clinica: patient.cartella_clinica,
      polizza_assicurativa: patient.polizza_assicurativa
    };
  }
}

// Export a singleton instance
export const patientService = new PatientService();