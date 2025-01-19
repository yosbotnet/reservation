import { prisma } from '../index.js';
import bcrypt from 'bcryptjs';

// User Management
export const createUser = async (req, res, next) => {
  const { username, password, tipoutente, ...userData } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    const result = await prisma.$transaction(async (prisma) => {
      let riferimentoId = null;

      // Create role-specific record first
      if (tipoutente === 'dottore') {
        const doctor = await prisma.dOTTORE.create({
          data: {
            numeroRegistrazione: userData.numeroRegistrazione,
            nome: userData.nome,
            cognome: userData.cognome,
            specializzazioni: userData.specializzazioni
          }
        });
        riferimentoId = doctor.numeroRegistrazione;
      }

      // Create user account
      const user = await prisma.uTENTE.create({
        data: {
          username,
          password: hashedPassword,
          tipoutente,
          riferimentoId
        }
      });

      return { user, riferimentoId };
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: result.user.id
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { password, ...updateData } = req.body;

  try {
    const data = { ...updateData };
    if (password) {
      data.password = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );
    }

    const user = await prisma.uTENTE.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({
      message: 'User updated successfully',
      userId: user.id
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.uTENTE.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Operating Room Management
export const createOperatingRoom = async (req, res, next) => {
  const { codice, nome, attrezzatureFisse } = req.body;

  try {
    const room = await prisma.sALA_OPERATORIA.create({
      data: {
        codice,
        nome,
        attrezzatureFisse,
        disponibile: true
      }
    });

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateOperatingRoom = async (req, res, next) => {
  const { codice } = req.params;
  const updateData = req.body;

  try {
    const room = await prisma.sALA_OPERATORIA.update({
      where: { codice },
      data: updateData
    });

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// Equipment Management
export const createEquipment = async (req, res, next) => {
  const { codiceInventario, nome, stato, ultimaManutenzione } = req.body;

  try {
    const equipment = await prisma.aTTREZZATURA.create({
      data: {
        codiceInventario,
        nome,
        stato,
        ultimaManutenzione: ultimaManutenzione ? new Date(ultimaManutenzione) : null
      }
    });

    res.status(201).json(equipment);
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req, res, next) => {
  const { codiceInventario } = req.params;
  const updateData = req.body;

  try {
    if (updateData.ultimaManutenzione) {
      updateData.ultimaManutenzione = new Date(updateData.ultimaManutenzione);
    }

    const equipment = await prisma.aTTREZZATURA.update({
      where: { codiceInventario },
      data: updateData
    });

    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

// Surgery Types Management
export const createSurgeryType = async (req, res, next) => {
  const { nome, durataStimata, descrizione, complessita, attrezzatureNecessarie } = req.body;

  try {
    const surgeryType = await prisma.$transaction(async (prisma) => {
      const type = await prisma.tIPO_INTERVENTO.create({
        data: {
          nome,
          durataStimata,
          descrizione,
          complessita
        }
      });

      if (attrezzatureNecessarie?.length) {
        await prisma.aTTREZZATURA_TIPO_INTERVENTO.createMany({
          data: attrezzatureNecessarie.map(attrezzaturaId => ({
            tipoInterventoId: type.id,
            attrezzaturaId
          }))
        });
      }

      return type;
    });

    res.status(201).json(surgeryType);
  } catch (error) {
    next(error);
  }
};

// Statistics
export const getStatistics = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const [
      roomOccupancy,
      surgeryDurations,
      doctorSuccess,
      yearlyStats
    ] = await Promise.all([
      // Room occupancy rates
      prisma.iNTERVENTO.groupBy({
        by: ['salaOperatoriaId'],
        _count: true,
        where: {
          SLOT_DISPONIBILE: {
            dataOraInizio: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
      }),
      // Surgery duration analysis
      prisma.iNTERVENTO.findMany({
        where: {
          stato: 'COMPLETATO',
          SLOT_DISPONIBILE: {
            dataOraInizio: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        },
        select: {
          durataEffettiva: true,
          TIPO_INTERVENTO: {
            select: {
              durataStimata: true
            }
          }
        }
      }),
      // Success rate by doctor
      prisma.iNTERVENTO.groupBy({
        by: ['dottoreId'],
        _count: {
          successo: true
        },
        where: {
          stato: 'COMPLETATO',
          SLOT_DISPONIBILE: {
            dataOraInizio: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
      }),
      // Yearly surgery statistics
      prisma.iNTERVENTO.groupBy({
        by: ['tipoInterventoId'],
        _count: true,
        where: {
          SLOT_DISPONIBILE: {
            dataOraInizio: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
      })
    ]);

    res.json({
      roomOccupancy,
      surgeryDurations,
      doctorSuccess,
      yearlyStats
    });
  } catch (error) {
    next(error);
  }
};