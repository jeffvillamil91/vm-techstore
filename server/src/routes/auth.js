import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { query } from '../db/pool.js';
import { requireAuth, signUser } from '../middleware/auth.js';

const router = Router();
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(60).required(),
  password: Joi.string().min(6).max(80).required()
});

router.post('/login', async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Usuario y clave son obligatorios' });

  try {
    const [user] = await query(
      'SELECT id, username, password_hash, full_name, role FROM users WHERE username = :username LIMIT 1',
      { username: value.username }
    );
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const validPassword = await bcrypt.compare(value.password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const token = signUser(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
