import { prisma } from '../index.js';

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.dottore.findMany({
      select: {
        cf: true,
        numeroregistrazione: true,
        utente: {
          select: {
            nome: true,
            cognome: true,
          }
        },
        specializzato_in: {
          select: {
            specializzazione: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    });
    
    // Transform the response to match expected format
    const formattedDoctors = doctors.map(doc => ({
      cf : doc.cf,
      numeroregistrazione: doc.numeroregistrazione,
      nome: doc.utente.nome,
      cognome: doc.utente.cognome,
      specializzazioni: doc.specializzato_in.map(s => s.specializzazione.nome)
    }));
    
    res.json(formattedDoctors);
  } catch (error) {
    next(error);
  }
};

export const getAllergiesById = async (req, res, next) => {
  const { patientId } = req.params;
  try {
    const allergie = await prisma.allergia.findMany({
      where: {
        cf: patientId
      },
      select: {
        nomeallergia: true
      }
    });
    
    res.json(allergie);
  } catch (error) {
    next(error);
  }
};

export const getAllergies = async (req, res, next) => {
  try {
    const allergie = await prisma.allergia.findMany({
      distinct: ['nomeallergia'],
      select: {
        nomeallergia: true
      }
    });

    // Transform to get unique allergy names
    const uniqueAllergies = [...new Set(allergie.map(a => a.nomeallergia))];
    res.json(uniqueAllergies.map(nome => ({ nome })));
  } catch (error) {
    next(error);
  }
};

export const getDoctorAvailability = async (req, res, next) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  try {
    // Get doctor's weekly schedule
    const weeklySchedule = await prisma.orariodilavoro.findMany({
      where: {
        cf: doctorId
      }
    });

    // Get existing appointments (visits and surgeries) in the date range
    const appointments = await prisma.$transaction([
      prisma.visita.findMany({
        where: {
          cf_dottore: doctorId,
          dataora: {
            gte: startDateTime,
            lte: endDateTime
          }
        }
      }),
      prisma.intervento.findMany({
        where: {
          cf_dottore: doctorId,
          dataoranizio: {
            gte: startDateTime,
            lte: endDateTime
          }
        }
      })
    ]);

    res.json({
      weeklySchedule,
      appointments: {
        visits: appointments[0],
        surgeries: appointments[1]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  const { doctorId, patientId, appointmentDateTime, motivo } = req.body;

  try {
    // Check if the doctor is available at the requested time
    const appointmentDate = new Date(appointmentDateTime);
    const dayOfWeek = appointmentDate.getDay();
    const timeOfDay = appointmentDate.toTimeString().slice(0, 8);

    // Get doctor's schedule for that day
    const doctorSchedule = await prisma.$queryRaw`
          SELECT * FROM orariodilavoro 
          WHERE cf = ${doctorId} 
          AND giornodellaSettimana = ${dayOfWeek}
          AND orainizio <= ${timeOfDay}
          AND orafine >= ${timeOfDay}
        `;

    if (!doctorSchedule) {
      return res.status(400).json({ error: 'Doctor is not available at this time' });
    }

    // Check for existing appointments at the same time
    const existingAppointments = await prisma.$transaction([
      prisma.visita.findFirst({
        where: {
          cf_dottore: doctorId,
          dataora: appointmentDate
        }
      }),
      prisma.intervento.findFirst({
        where: {
          cf_dottore: doctorId,
          dataoranizio: {
            lte: appointmentDate
          },
          dataorafine: {
            gte: appointmentDate
          }
        }
      })
    ]);

    if (existingAppointments[0] || existingAppointments[1]) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Create visit
    const visit = await prisma.visita.create({
      data: {
        cf_paziente: patientId,
        cf_dottore: doctorId,
        dataora: appointmentDate,
        motivo
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
    const appointments = await prisma.visita.findMany({
      where: {
        cf_paziente: patientId
      },
      include: {
        dottore: {
          include: {
            utente: {
              select: {
                nome: true,
                cognome: true
              }
            },
            specializzato_in: {
              include: {
                specializzazione: {
                  select: {
                    nome: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        dataora: 'desc'
      }
    });

    // Transform the response to match expected format
    const formattedAppointments = appointments.map(apt => ({
      id_visita: apt.id_visita,
      dataora: apt.dataora,
      motivo: apt.motivo,
      dottore: {
        nome: apt.dottore.utente.nome,
        cognome: apt.dottore.utente.cognome,
        specializzazioni: apt.dottore.specializzato_in.map(s => s.specializzazione.nome)
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    next(error);
  }
};