import express from 'express';
import { register, login } from '../controllers/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validators.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registration endpoint
router.post('/register', registerValidation, validate, register);

// Login endpoint
router.post('/login', loginValidation, validate, login);

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      ruolo: req.user.ruolo
    }
  });
});

export default router;