import { prisma } from '../index.js';
import bcrypt from 'bcryptjs';

// User Management
export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.utente.findMany({
      select: {
        cf: true,
        username: true,
        nome: true,
        cognome: true,
        tipoutente: true,
        datanascita: true,
        telefono: true
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { username, password, tipoutente, ...userData } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    const result = await prisma.$transaction(async (prisma) => {
      // Create base user account
      const user = await prisma.utente.create({
        data: {
          cf: userData.cf,
          username,
          password: hashedPassword,
          nome: userData.nome,
          cognome: userData.cognome,
          datanascita: new Date(userData.datanascita),
          telefono: userData.telefono,
          tipoutente
        }
      });

      // Create role-specific record
      if (tipoutente === 'dottore') {
        await prisma.dottore.create({
          data: {
            cf: user.cf,
            numeroregistrazione: userData.numeroregistrazione,
            dataassunzione: new Date(),
            iban: userData.iban
          }
        });

        // Handle specializations if provided
        if (userData.specializzazioni?.length) {
          await prisma.specializzato_in.createMany({
            data: userData.specializzazioni.map(specId => ({
              cf: user.cf,
              id_specializzazione: specId
            }))
          });
        }
      } else if (tipoutente === 'paziente') {
        await prisma.paziente.create({
          data: {
            cf: user.cf,
            grupposanguigno: userData.grupposanguigno
          }
        });
      }

      return user;
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: result.cf
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { cf } = req.params;
  const { password, ...updateData } = req.body;

  try {
    const data = { ...updateData };
    if (password) {
      data.password = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );
    }

    const user = await prisma.utente.update({
      where: { cf },
      data
    });

    res.json({
      message: 'User updated successfully',
      userId: user.cf
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { cf } = req.params;

  try {
    await prisma.utente.delete({
      where: { cf }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Operating Room Management
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.sala_operativa.findMany({
      include: {
        contiene: {
          include: {
            attrezzatura: true
          }
        }
      }
    });
    
    const formattedRooms = rooms.map(room => ({
      codice: room.id_sala,
      nome: room.nome,
      disponibile: room.disponibile,
      attrezzatureFisse: room.contiene.map(c => c.attrezzatura.nome)
    }));
    
    res.json(formattedRooms);
  } catch (error) {
    next(error);
  }
};

export const createOperatingRoom = async (req, res, next) => {
  const { nome, attrezzature } = req.body;

  try {
    const room = await prisma.$transaction(async (prisma) => {
      const sala = await prisma.sala_operativa.create({
        data: {
          nome
        }
      });

      if (attrezzature?.length) {
        await prisma.contiene.createMany({
          data: attrezzature.map(attrezzaturaId => ({
            id_sala: sala.id_sala,
            id_attrezzatura: attrezzaturaId
          }))
        });
      }

      return sala;
    });

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateOperatingRoom = async (req, res, next) => {
  const { id_sala } = req.params;
  const { nome, attrezzature } = req.body;

  try {
    const room = await prisma.$transaction(async (prisma) => {
      // Update room name
      const sala = await prisma.sala_operativa.update({
        where: { id_sala: parseInt(id_sala) },
        data: { nome }
      });

      // Update equipment if provided
      if (attrezzature) {
        // Remove existing equipment
        await prisma.contiene.deleteMany({
          where: { id_sala: parseInt(id_sala) }
        });

        // Add new equipment
        if (attrezzature.length) {
          await prisma.contiene.createMany({
            data: attrezzature.map(attrezzaturaId => ({
              id_sala: sala.id_sala,
              id_attrezzatura: attrezzaturaId
            }))
          });
        }
      }

      return sala;
    });

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// Equipment Management
export const getEquipment = async (req, res, next) => {
  try {
    const equipment = await prisma.attrezzatura.findMany({
      select: {
        id_attrezzatura: true,
        nome: true,
      }
    });
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req, res, next) => {
  const { nome } = req.body;

  try {
    const equipment = await prisma.attrezzatura.create({
      data: {
        nome
      }
    });

    res.status(201).json(equipment);
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req, res, next) => {
  const { id_attrezzatura } = req.params;
  const { nome } = req.body;

  try {
    const equipment = await prisma.attrezzatura.update({
      where: { id_attrezzatura: parseInt(id_attrezzatura) },
      data: { nome }
    });

    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

// Surgery Types Management
export const getSurgeryTypes = async (req, res, next) => {
  try {
    const types = await prisma.tipo_intervento.findMany({
      include: {
        richiede_attrezzatura: {
          include: {
            attrezzatura: true
          }
        }
      }
    });
    
    const formattedTypes = types.map(type => ({
      id: type.id_tipo,
      nome: type.nome,
      durata: type.durata,
      complessita: type.complessita,
      costo: parseFloat(type.costo),
      attrezzatureNecessarie: type.richiede_attrezzatura.map(r => r.attrezzatura)
    }));
    
    res.json(formattedTypes);
  } catch (error) {
    next(error);
  }
};

export const createSurgeryType = async (req, res, next) => {
  const { nome, durata, complessita, costo, attrezzature } = req.body;

  try {
    const surgeryType = await prisma.$transaction(async (prisma) => {
      const type = await prisma.tipo_intervento.create({
        data: {
          nome,
          durata,
          complessita,
          costo: parseFloat(costo)
        }
      });

      if (attrezzature?.length) {
        await prisma.richiede_attrezzatura.createMany({
          data: attrezzature.map(attrezzaturaId => ({
            id_tipo: type.id_tipo,
            id_attrezzatura: attrezzaturaId
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

export const updateSurgeryType = async (req, res, next) => {
  const { id_tipo } = req.params;
  const { nome, durata, complessita, costo, attrezzature } = req.body;

  try {
    const surgeryType = await prisma.$transaction(async (prisma) => {
      // Update surgery type
      const type = await prisma.tipo_intervento.update({
        where: { id_tipo: parseInt(id_tipo) },
        data: {
          nome,
          durata,
          complessita,
          costo: parseFloat(costo)
        }
      });

      // Update equipment if provided
      if (attrezzature) {
        // Remove existing equipment
        await prisma.richiede_attrezzatura.deleteMany({
          where: { id_tipo: parseInt(id_tipo) }
        });

        // Add new equipment
        if (attrezzature.length) {
          await prisma.richiede_attrezzatura.createMany({
            data: attrezzature.map(attrezzaturaId => ({
              id_tipo: type.id_tipo,
              id_attrezzatura: attrezzaturaId
            }))
          });
        }
      }

      return type;
    });

    res.json(surgeryType);
  } catch (error) {
    next(error);
  }
};

export const deleteSurgeryType = async (req, res, next) => {
  const { id_tipo } = req.params;

  try {
    await prisma.$transaction(async (prisma) => {
      // First delete all equipment requirements
      await prisma.richiede_attrezzatura.deleteMany({
        where: { id_tipo: parseInt(id_tipo) }
      });

      // Then delete the surgery type
      await prisma.tipo_intervento.delete({
        where: { id_tipo: parseInt(id_tipo) }
      });
    });

    res.json({ message: 'Surgery type deleted successfully' });
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
      doctorStats,
      yearlyStats
    ] = await Promise.all([
      // Room occupancy rates
      prisma.intervento.groupBy({
        by: ['id_sala'],
        _count: true,
        where: {
          dataoranizio: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      }),
      // Surgery duration analysis
      prisma.intervento.findMany({
        where: {
          esito: 'completato',
          dataoranizio: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        select: {
          id_intervento: true,
          dataoranizio: true,
          dataorafine: true,
          tipo_intervento: {
            select: {
              durata: true
            }
          }
        }
      }),
      // Doctor statistics
      prisma.intervento.groupBy({
        by: ['cf_dottore'],
        _count: {
          _all: true
        },
        where: {
          esito: 'completato',
          dataoranizio: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      }),
      // Yearly surgery statistics by type
      prisma.intervento.groupBy({
        by: ['id_tipo'],
        _count: true,
        where: {
          dataoranizio: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      })
    ]);

    res.json({
      roomOccupancy,
      surgeryDurations: surgeryDurations.map(surgery => ({
        id: surgery.id_intervento,
        actualDuration: Math.round((new Date(surgery.dataorafine) - new Date(surgery.dataoranizio)) / 1000 / 60),
        estimatedDuration: surgery.tipo_intervento.durata
      })),
      doctorStats,
      yearlyStats
    });
  } catch (error) {
    next(error);
  }
};
