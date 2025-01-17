import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  const {
    username,
    password,
    ruolo,
    nome,
    cognome,
    email,
    telefono,
    // PAZIENTE specific fields
    codiceFiscale,
    dataNascita,
    gruppoSanguigno,
    allergie,
    // DOTTORE specific fields
    numeroRegistrazione,
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
      // Create user account
      const user = await prisma.uTENTE.create({
        data: {
          username,
          password: hashedPassword,
          ruolo,
          riferimentoId: ruolo === 'PAZIENTE' ? codiceFiscale : 
                        ruolo === 'DOTTORE' ? numeroRegistrazione : 
                        null
        },
      });

      // Create role-specific record
      if (ruolo === 'PAZIENTE') {
        await prisma.pAZIENTE.create({
          data: {
            codiceFiscale,
            nome,
            cognome,
            dataNascita: new Date(dataNascita),
            email,
            telefono,
            gruppoSanguigno,
            allergie,
          },
        });
      } else if (ruolo === 'DOTTORE') {
        await prisma.dOTTORE.create({
          data: {
            numeroRegistrazione,
            nome,
            cognome,
            specializzazioni,
          },
        });
      }

      return user;
    });

    // Generate JWT token
    const token = generateToken(result.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.id,
        username: result.username,
        ruolo: result.ruolo,
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
    const user = await prisma.uTENTE.findUnique({
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
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        ruolo: user.ruolo,
      },
    });
  } catch (error) {
    next(error);
  }
};