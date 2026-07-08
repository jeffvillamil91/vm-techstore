import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(60).required(),
  password: Joi.string().min(6).max(80).required(),
  full_name: Joi.string().min(3).max(120).required(),
  role: Joi.string().valid('admin', 'seller').required()
});

router.use(requireAuth, requireRole('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, username, full_name, role, created_at
       FROM users
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { error, value } = userSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details.map((detail) => detail.message).join(', ') });

  try {
    const password_hash = await bcrypt.hash(value.password, 10);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES (:username, :password_hash, :full_name, :role)`,
      { ...value, password_hash }
    );
    res.status(201).json({
      id: result.insertId,
      username: value.username,
      full_name: value.full_name,
      role: value.role
    });
  } catch (error) {
    error.status = error.code === 'ER_DUP_ENTRY' ? 409 : error.status;
    error.message = error.code === 'ER_DUP_ENTRY' ? 'El usuario ya existe' : error.message;
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: 'No puede eliminar su propio usuario' });

  try {
    const result = await query('DELETE FROM users WHERE id = :id', { id });
    if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
