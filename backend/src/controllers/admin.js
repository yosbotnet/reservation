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

export const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await prisma.specializzazione.findMany({
      select: {
        id_specializzazione: true,
        nome: true
      }
    });
    res.json(specializations);
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  const { username, password, specializzazioni, ...doctorData } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    const result = await prisma.$transaction(async (prisma) => {
      // Create base user account
      const user = await prisma.utente.create({
        data: {
          cf: doctorData.cf,
          username,
          password: hashedPassword,
          nome: doctorData.nome,
          cognome: doctorData.cognome,
          datanascita: new Date(doctorData.datanascita),
          telefono: doctorData.telefono,
          tipoutente: 'dottore'
        }
      });

      // Create doctor record
      await prisma.dottore.create({
        data: {
          cf: user.cf,
          numeroregistrazione: doctorData.numeroregistrazione,
          dataassunzione: new Date(),
          iban: doctorData.iban
        }
      });

      // Add specializations
      if (specializzazioni?.length) {
        await prisma.specializzato_in.createMany({
          data: specializzazioni.map(specId => ({
            cf: user.cf,
            id_specializzazione: specId
          }))
        });
      }

      // Return complete doctor data
      return prisma.utente.findUnique({
        where: {
          cf: "LTFMLV39E01E189B"
        },
        include: {
          dottore: {
            include: {
              specializzato_in: {
                include: {
                  specializzazione: true
                }
              }
            }
          },
          paziente: true
        }
      });
    });
    res.status(201).json(result);
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
    await deleteUserBackEnd(cf);
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Admin users cannot be deleted') {
      res.status(403).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

async function deleteUserBackEnd(cf) {
  return await prisma.$transaction(async (prisma) => {
    // First check if user exists and get their type
    const user = await prisma.utente.findUnique({
      where: { cf },
      select: {
        tipoutente: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent admin deletion
    if (user.tipoutente === 'admin') {
      throw new Error('Admin users cannot be deleted');
    }

    if (user.tipoutente === 'dottore') {
      // Delete all doctor's work hours
      await prisma.orariodilavoro.deleteMany({
        where: { cf }
      });

      // Delete specializations
      await prisma.specializzato_in.deleteMany({
        where: { cf }
      });

      // Delete visits
      await prisma.visita.deleteMany({
        where: { cf_dottore: cf }
      });

      // Get all interventions by this doctor
      const interventions = await prisma.intervento.findMany({
        where: { cf_dottore: cf },
        select: { id_intervento: true }
      });

      // Handle postoperative protocols if they exist
      if (interventions.length > 0) {
        const protocols = await prisma.cura_postoperativa.findMany({
          where: {
            id_intervento: {
              in: interventions.map(i => i.id_intervento)
            }
          },
          select: { id_cura: true }
        });

        if (protocols.length > 0) {
          const protocolIds = protocols.map(p => p.id_cura);
          
          // Delete all related records
          await prisma.daprendere.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
          
          await prisma.daevitare.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
          
          await prisma.cura_postoperativa.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
        }
      }

      // Delete interventions
      await prisma.intervento.deleteMany({
        where: { cf_dottore: cf }
      });

      // Delete doctor record
      await prisma.dottore.delete({
        where: { cf }
      });
    }

    if (user.tipoutente === 'paziente') {
      // Delete allergies
      await prisma.allergia.deleteMany({
        where: { cf }
      });

      // Delete visits
      await prisma.visita.deleteMany({
        where: { cf_paziente: cf }
      });

      // Get all interventions for this patient
      const interventions = await prisma.intervento.findMany({
        where: { cf_paziente: cf },
        select: { id_intervento: true }
      });

      // Handle postoperative protocols if they exist
      if (interventions.length > 0) {
        const protocols = await prisma.cura_postoperativa.findMany({
          where: {
            id_intervento: {
              in: interventions.map(i => i.id_intervento)
            }
          },
          select: { id_cura: true }
        });

        if (protocols.length > 0) {
          const protocolIds = protocols.map(p => p.id_cura);
          
          // Delete all related records
          await prisma.daprendere.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
          
          await prisma.daevitare.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
          
          await prisma.cura_postoperativa.deleteMany({
            where: { id_cura: { in: protocolIds } }
          });
        }
      }

      // Delete interventions
      await prisma.intervento.deleteMany({
        where: { cf_paziente: cf }
      });

      // Delete patient record
      await prisma.paziente.delete({
        where: { cf }
      });
    }

    // Finally delete the user
    return await prisma.utente.delete({
      where: { cf }
    });
  });
}

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
