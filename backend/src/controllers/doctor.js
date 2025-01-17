import { prisma } from '../index.js';

export const setWeeklyAvailability = async (req, res, next) => {
  const { dottoreId, availabilities } = req.body;

  try {
    // Verify doctor exists
    const doctor = await prisma.dOTTORE.findUnique({
      where: { numeroRegistrazione: dottoreId }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Use transaction to update availabilities
    const result = await prisma.$transaction(async (prisma) => {
      // Delete existing recurring availabilities
      await prisma.dISPONIBILITA_SETTIMANALE.deleteMany({
        where: {
          dottoreId,
          ricorrente: true
        }
      });

      // Create new availabilities
      const created = await prisma.dISPONIBILITA_SETTIMANALE.createMany({
        data: availabilities.map(avail => ({
          dottoreId,
          giorno: avail.giorno,
          oraInizio: avail.oraInizio,
          oraFine: avail.oraFine,
          ricorrente: true
        }))
      });

      return created;
    });

    res.json({
      message: 'Weekly availability updated successfully',
      count: result.count
    });
  } catch (error) {
    next(error);
  }
};

export const registerUnavailability = async (req, res, next) => {
  const { dottoreId, dataInizio, dataFine, motivo } = req.body;

  try {
    const unavailability = await prisma.iNDISPONIBILITA.create({
      data: {
        dottoreId,
        dataInizio: new Date(dataInizio),
        dataFine: new Date(dataFine),
        motivo,
        approvata: false
      }
    });

    res.status(201).json(unavailability);
  } catch (error) {
    next(error);
  }
};

export const getSchedule = async (req, res, next) => {
  const { dottoreId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const schedule = await prisma.sLOT_DISPONIBILE.findMany({
      where: {
        dottoreId,
        dataOraInizio: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        VISITA: {
          include: {
            PAZIENTE: {
              select: {
                nome: true,
                cognome: true,
                codiceFiscale: true,
                gruppoSanguigno: true,
                allergie: true
              }
            }
          }
        },
        INTERVENTO: {
          include: {
            PAZIENTE: {
              select: {
                nome: true,
                cognome: true,
                codiceFiscale: true,
                gruppoSanguigno: true,
                allergie: true
              }
            },
            TIPO_INTERVENTO: true,
            SALA_OPERATORIA: true
          }
        }
      },
      orderBy: {
        dataOraInizio: 'asc'
      }
    });

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

export const updateVisitOutcome = async (req, res, next) => {
  const { visitId } = req.params;
  const { diagnosi, stato } = req.body;

  try {
    const visit = await prisma.vISITA.update({
      where: { id: parseInt(visitId) },
      data: {
        diagnosi,
        stato
      }
    });

    res.json(visit);
  } catch (error) {
    next(error);
  }
};

export const scheduleSurgery = async (req, res, next) => {
  const {
    pazienteId,
    dottoreId,
    tipoInterventoId,
    salaOperatoriaId,
    slotId,
    note
  } = req.body;

  try {
    const surgery = await prisma.iNTERVENTO.create({
      data: {
        pazienteId,
        dottoreId,
        tipoInterventoId,
        salaOperatoriaId,
        slotId,
        note,
        stato: 'PROGRAMMATO'
      },
      include: {
        PAZIENTE: true,
        TIPO_INTERVENTO: true,
        SALA_OPERATORIA: true,
        SLOT_DISPONIBILE: true
      }
    });

    res.status(201).json(surgery);
  } catch (error) {
    next(error);
  }
};