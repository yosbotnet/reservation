import { prisma } from '../index.js';

export const setWeeklyAvailability = async (req, res, next) => {
  const { cf_dottore, availabilities } = req.body;

  try {
    // Verify doctor exists
    const doctor = await prisma.dottore.findUnique({
      where: { cf: cf_dottore }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Use transaction to update availabilities
    const result = await prisma.$transaction(async (prisma) => {
      // Delete existing schedule
      await prisma.orariodilavoro.deleteMany({
        where: {
          cf: cf_dottore
        }
      });

      // Create new schedule
      const created = await prisma.orariodilavoro.createMany({
        data: availabilities.map(avail => ({
          cf: cf_dottore,
          giornodellaSettimana: avail.giorno.toLowerCase(),
          orainizio: avail.orainizio,
          orafine: avail.orafine
        }))
      });

      return created;
    });

    res.json({
      message: 'Weekly schedule updated successfully',
      count: result.count
    });
  } catch (error) {
    next(error);
  }
};

export const getSchedule = async (req, res, next) => {
  const { dottoreId } = req.params;
  const { startDate, endDate } = req.query;
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  const cf_dottore = dottoreId;

  try {
    // Get all scheduled activities (visits and surgeries)
    const [visits, surgeries] = await prisma.$transaction([
      prisma.visita.findMany({
        where: {
          cf_dottore,
          dataora: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        include: {
          paziente: {
            include: {
              utente: {
                select: {
                  nome: true,
                  cognome: true
                }
              },
              allergia: true
            }
          }
        }
      }),
      prisma.intervento.findMany({
        where: {
          cf_dottore,
          dataoranizio: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        include: {
          paziente: {
            include: {
              utente: {
                select: {
                  nome: true,
                  cognome: true
                }
              },
              allergia: true
            }
          },
          tipo_intervento: true,
          sala_operativa: true
        }
      })
    ]);

    // Format response
    const schedule = {
      visits: visits.map(visit => ({
        id_visita: visit.id_visita,
        dataora: visit.dataora,
        motivo: visit.motivo,
        paziente: {
          cf: visit.cf_paziente,
          nome: visit.paziente.utente.nome,
          cognome: visit.paziente.utente.cognome,
          grupposanguigno: visit.paziente.grupposanguigno,
          allergie: visit.paziente.allergia.map(a => a.nomeallergia)
        }
      })),
      surgeries: surgeries.map(surgery => ({
        id_intervento: surgery.id_intervento,
        dataoranizio: surgery.dataoranizio,
        dataorafine: surgery.dataorafine,
        esito: surgery.esito,
        paziente: {
          cf: surgery.cf_paziente,
          nome: surgery.paziente.utente.nome,
          cognome: surgery.paziente.utente.cognome,
          grupposanguigno: surgery.paziente.grupposanguigno,
          allergie: surgery.paziente.allergia.map(a => a.nomeallergia)
        },
        tipo_intervento: surgery.tipo_intervento,
        sala_operativa: surgery.sala_operativa
      }))
    };

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

export const updateVisitOutcome = async (req, res, next) => {
  const { id_visita } = req.params;
  const { motivo } = req.body;

  try {
    const visit = await prisma.visita.update({
      where: { id_visita: parseInt(id_visita) },
      data: {
        motivo
      }
    });

    res.json(visit);
  } catch (error) {
    next(error);
  }
};

export const scheduleSurgery = async (req, res, next) => {
  const {
    cf_paziente,
    cf_dottore,
    id_tipo,
    id_sala,
    dataoranizio,
    dataorafine,
    note
  } = req.body;

  try {
    // Check if the operating room is available
    const conflictingSurgery = await prisma.intervento.findFirst({
      where: {
        id_sala,
        OR: [
          {
            AND: [
              { dataoranizio: { lte: new Date(dataoranizio) } },
              { dataorafine: { gt: new Date(dataoranizio) } }
            ]
          },
          {
            AND: [
              { dataoranizio: { lt: new Date(dataorafine) } },
              { dataorafine: { gte: new Date(dataorafine) } }
            ]
          }
        ]
      }
    });

    if (conflictingSurgery) {
      return res.status(400).json({ error: 'Operating room is not available at this time' });
    }

    const surgery = await prisma.intervento.create({
      data: {
        cf_paziente,
        cf_dottore,
        id_tipo,
        id_sala,
        dataoranizio: new Date(dataoranizio),
        dataorafine: new Date(dataorafine),
        esito: 'programmato'
      },
      include: {
        paziente: {
          include: {
            utente: true
          }
        },
        tipo_intervento: true,
        sala_operativa: true
      }
    });

    res.status(201).json(surgery);
  } catch (error) {
    next(error);
  }
};