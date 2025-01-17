import { prisma } from '../index.js';

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.dOTTORE.findMany({
      select: {
        numeroRegistrazione: true,
        nome: true,
        cognome: true,
        specializzazioni: true
      }
    });
    
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};
export const getAllergiesById = async (req, res, next) => {
    const { patientId } = req.params;
    try {
        
        const allergie = await prisma.pAZIENTE_ALLERGIA.findMany({
            where: {
                pazienteId: patientId
            },
            include: {
                ALLERGIA: true
            }
        })
    } catch (error) {
        next(error);
        
    }
};
export const getAllergies = async (req, res, next) => {
    try{
        const allergie = await prisma.aLLERGIA.findMany({
            select:{
                nome:true,
                id:false,
            }
        });

        res.json(allergie);
        return;
    } catch (error) 
    {
        next(error);
    }

};
export const getDoctorAvailability = async (req, res, next) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Get doctor's weekly availability
    const weeklyAvailability = await prisma.dISPONIBILITA_SETTIMANALE.findMany({
      where: {
        dottoreId: doctorId,
        OR: [
          { dataFine: null },
          { dataFine: { gte: startDate } }
        ]
      }
    });

    // Get doctor's unavailability periods
    const unavailabilityPeriods = await prisma.iNDISPONIBILITA.findMany({
      where: {
        dottoreId: doctorId,
        dataFine: { gte: startDate },
        dataInizio: { lte: endDate },
        approvata: true
      }
    });

    // Get existing appointments
    const existingSlots = await prisma.sLOT_DISPONIBILE.findMany({
      where: {
        dottoreId: doctorId,
        dataOraInizio: { gte: startDate },
        dataOraFine: { lte: endDate }
      },
      include: {
        VISITA: true,
        INTERVENTO: true
      }
    });

    res.json({
      weeklyAvailability,
      unavailabilityPeriods,
      existingSlots
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  const { doctorId, patientId, slotId, motivo } = req.body;

  try {
    // Check if slot is available
    const slot = await prisma.sLOT_DISPONIBILE.findUnique({
      where: { id: slotId },
      include: {
        VISITA: true,
        INTERVENTO: true
      }
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (!slot.prenotabile || slot.VISITA.length > 0 || slot.INTERVENTO.length > 0) {
      return res.status(400).json({ error: 'Slot is not available' });
    }

    // Create visit
    const visit = await prisma.vISITA.create({
      data: {
        pazienteId: patientId,
        dottoreId: doctorId,
        slotId: slotId,
        motivo,
        stato: 'RICHIESTA'
      }
    });

    res.status(201).json(visit);
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointments = async (req, res, next) => {
  const { patientId } = req.params;

  try {
    const appointments = await prisma.vISITA.findMany({
      where: {
        pazienteId: patientId
      },
      include: {
        DOTTORE: {
          select: {
            nome: true,
            cognome: true,
            specializzazioni: true
          }
        },
        SLOT_DISPONIBILE: true
      },
      orderBy: {
        SLOT_DISPONIBILE: {
          dataOraInizio: 'desc'
        }
      }
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};