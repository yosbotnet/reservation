import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  const {
    username,
    password,
    tipoutente,
    nome,
    cognome,
    datanascita,
    telefono,
    // paziente specific fields
    cf,
    grupposanguigno,
    allergie,
    // dottore specific fields
    numeroregistrazione,
    dataassunzione,
    iban,
    specializzazioni,
  } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create base user account
      const user = await prisma.utente.create({
        data: {
          cf,
          username,
          password: hashedPassword,
          nome,
          cognome,
          datanascita: new Date(datanascita),
          telefono,
          tipoutente,
        },
      });

      // Create role-specific record
      if (tipoutente === 'paziente') {
        const paziente = await prisma.paziente.create({
          data: {
            cf: user.cf,
            grupposanguigno,
          },
        });

        // Create allergies if provided
        if (allergie && allergie.length > 0) {
          await prisma.allergia.createMany({
            data: allergie.map((allergia) => ({
              cf: user.cf,
              nomeallergia: allergia
            })),
          });
        }
      } else if (tipoutente === 'dottore') {
        const dottore = await prisma.dottore.create({
          data: {
            cf: user.cf,
            numeroregistrazione,
            dataassunzione: new Date(dataassunzione),
            iban,
          },
        });

        // Create specializations if provided
        if (specializzazioni && specializzazioni.length > 0) {
          // First ensure all specializations exist
          for (const spec of specializzazioni) {
            await prisma.specializzazione.upsert({
              where: { nome: spec },
              update: {},
              create: { nome: spec },
            });
          }

          // Get all specialization IDs
          const specIds = await prisma.specializzazione.findMany({
            where: {
              nome: {
                in: specializzazioni
              }
            },
            select: {
              id_specializzazione: true
            }
          });

          // Create relationships
          await prisma.specializzato_in.createMany({
            data: specIds.map((spec) => ({
              cf: user.cf,
              id_specializzazione: spec.id_specializzazione
            })),
          });
        }
      }

      return user;
    });

    // Generate JWT token
    const token = generateToken(result.cf);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        cf: result.cf,
        username: result.username,
        tipoutente: result.tipoutente,
      },
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(409).json({
        error: `${field} already exists`,
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = await prisma.utente.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user.cf);

    res.json({
      message: 'Login successful',
      token,
      user: {
        cf: user.cf,
        username: user.username,
        tipoutente: user.tipoutente,
      },
    });
  } catch (error) {
    next(error);
  }
};