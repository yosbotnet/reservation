import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

interface PatientRequest {
  CF: string;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  gruppo_sanguigno?: string;
  allergie?: string;
  patologie_croniche?: string;
}

interface PatientResponse {
  CF: string;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  gruppo_sanguigno?: string;
  allergie?: string;
  patologie_croniche?: string;
}

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Patient routes
app.post('/api/patients', async (req, res) => {
  const {
    CF,
    nome,
    cognome,
    email,
    telefono,
    gruppo_sanguigno,
    allergie,
    patologie_croniche
  } = req.body;

  try {
    const newPatient = await prisma.$transaction(async (tx) => {
      // Create Persona first
      const persona = await tx.persona.create({
        data: {
          CF,
          nome,
          cognome,
          email,
          telefono
        }
      });

      // Then create Paziente
      return await tx.paziente.create({
        data: {
          CF,
          gruppo_sanguigno,
          allergie,
          patologie_croniche
        },
        include: {
          persona: true
        }
      });
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create patient' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.paziente.findMany({
      include: {
        persona: true,
        polizze: true
      }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});
app.get('/api/patients/:cf', async (req: Request, res: Response) => {
  const { cf } = req.params;
  try {
    const patient = await prisma.paziente.findUnique({
      where: { CF: cf },
      include: {
        persona: true,
        polizze: true,
        cartelle: true
      }
    });
    
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
    return;
  }
});

// Doctor routes
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.medico.findMany({
      include: {
        personale: {
          include: {
            persona: true
          }
        }
      }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Doctor availability routes
app.post('/api/doctors/:cf/availability', async (req: Request<{ cf: string }>, res: Response) => {
  const { cf } = req.params;
  const { data, ora_inizio, ora_fine } = req.body;

  try {
    const availability = await prisma.calendario_Disponibilita.create({
      data: {
        id: crypto.randomUUID(),
        CF_medico: cf,
        data: new Date(data),
        ora_inizio: new Date(`1970-01-01T${ora_inizio}`),
        ora_fine: new Date(`1970-01-01T${ora_fine}`)
      }
    });
    res.status(201).json(availability);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create availability slot' });
  }
});

app.get('/api/doctors/:cf/availability', async (req: Request<{ cf: string }>, res: Response) => {
  const { cf } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const availability = await prisma.calendario_Disponibilita.findMany({
      where: {
        CF_medico: cf,
        data: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      orderBy: {
        data: 'asc'
      }
    });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Surgery scheduling routes
app.post('/api/surgeries', async (req: Request, res: Response) => {
  const {
    CF_paziente,
    codice_tipo,
    numero_sala,
    data_ora,
    durata_prevista,
    medici
  } = req.body;

  try {
    const surgery = await prisma.$transaction(async (tx) => {
      // Create the surgery
      const intervento = await tx.intervento.create({
        data: {
          id: crypto.randomUUID(),
          CF_paziente,
          codice_tipo,
          numero_sala,
          data_ora: new Date(data_ora),
          durata_prevista,
          stato: 'scheduled',
          paziente: {
            connect: { CF: CF_paziente }
          },
          tipo: {
            connect: { codice: codice_tipo }
          },
          sala: {
            connect: { numero: numero_sala }
          }
        }
      });

      // Add assigned doctors
      await tx.medici_Intervento.createMany({
        data: medici.map((medico: { CF_medico: string, ruolo: string }) => ({
          id_intervento: intervento.id,
          CF_medico: medico.CF_medico,
          ruolo: medico.ruolo
        }))
      });

      return intervento;
    });

    res.status(201).json(surgery);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to schedule surgery' });
  }
});

app.get('/api/surgeries', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const surgeries = await prisma.intervento.findMany({
      where: {
        data_ora: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      include: {
        paziente: {
          include: {
            persona: true
          }
        },
        tipo: true,
        sala: true,
        medici: {
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
        }
      },
      orderBy: {
        data_ora: 'asc'
      }
    });
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surgeries' });
  }
});

// Post-operative care routes
interface PostOpCareRecord {
  id_intervento: string;
  CF_medico: string;
  data: Date;
  note: string;
  parametri_vitali: {
    pressione: string;
    frequenza_cardiaca: number;
    temperatura: number;
    saturazione_ossigeno: number;
  };
  medicazioni?: string;
  terapia?: string;
  complicanze?: string;
}

app.post('/api/post-op-care', async (req: Request, res: Response) => {
  const {
    id_intervento,
    CF_medico,
    data,
    note,
    parametri_vitali,
    medicazioni,
    terapia,
    complicanze
  } = req.body;

  try {
    const record = await prisma.cura_Post_Operativa.create({
      data: {
        id: crypto.randomUUID(),
        id_intervento,
        CF_medico,
        data: new Date(data),
        note,
        parametri_vitali: JSON.stringify(parametri_vitali),
        medicazioni,
        terapia,
        complicanze,
        intervento: {
          connect: { id: id_intervento }
        },
        medico: {
          connect: { CF: CF_medico }
        }
      }
    });
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create post-op care record' });
  }
});

app.get('/api/post-op-care/:interventionId', async (req: Request, res: Response) => {
  const { interventionId } = req.params;

  try {
    const records = await prisma.cura_Post_Operativa.findMany({
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
        data: 'asc'
      }
    });
    
    // Parse vital parameters
    const parsedRecords = records.map(record => ({
      ...record,
      parametri_vitali: JSON.parse(record.parametri_vitali)
    }));
    
    res.json(parsedRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post-op care records' });
  }
});

// Nursing staff routes
interface ShiftRequest {
  data: string;
  ora_inizio: string;
  ora_fine: string;
  tipo_turno: string;
}

interface NurseShiftAssignment {
  CF_infermiere: string;
}

app.post('/api/shifts', async (req: Request, res: Response) => {
  const { data, ora_inizio, ora_fine, tipo_turno } = req.body;

  try {
    const shift = await prisma.turno.create({
      data: {
        id: crypto.randomUUID(),
        data: new Date(data),
        ora_inizio: new Date(`1970-01-01T${ora_inizio}`),
        ora_fine: new Date(`1970-01-01T${ora_fine}`),
        tipo_turno
      }
    });
    res.status(201).json(shift);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create shift' });
  }
});

app.post('/api/shifts/:shiftId/assign', async (req: Request, res: Response) => {
  const { shiftId } = req.params;
  const { CF_infermiere } = req.body;

  try {
    const assignment = await prisma.turni_Infermiere.create({
      data: {
        id_turno: shiftId,
        CF_infermiere
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to assign nurse to shift' });
  }
});

app.get('/api/nurses/:cf/shifts', async (req: Request, res: Response) => {
  const { cf } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const shifts = await prisma.turni_Infermiere.findMany({
      where: {
        CF_infermiere: cf,
        turno: {
          data: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined
          }
        }
      },
      include: {
        turno: true
      },
      orderBy: {
        turno: {
          data: 'asc'
        }
      }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nurse shifts' });
  }
});

app.get('/api/shifts', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const shifts = await prisma.turno.findMany({
      where: {
        data: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      include: {
        infermieri: {
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
      },
      orderBy: {
        data: 'asc'
      }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});