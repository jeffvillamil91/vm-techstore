import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const clientSchema = Joi.object({
  full_name: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().max(120).required(),
  phone: Joi.string().pattern(/^09[0-9]{8}$/).required().messages({
    'string.pattern.base': 'El celular debe tener 10 numeros y empezar con 09'
  }),
  city: Joi.string().min(2).max(80).required(),
  address: Joi.string().allow('').max(180)
});

const validate = (req, _res, next) => {
  const { error, value } = clientSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    error.status = 400;
    error.message = error.details.map((detail) => detail.message).join(', ');
    return next(error);
  }
  req.body = value;
  return next();
};

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const search = `%${req.query.search || ''}%`;
    const rows = await query(
      `SELECT id, full_name, email, phone, city, address, created_at
       FROM clients
       WHERE full_name LIKE :search OR email LIKE :search OR phone LIKE :search
       ORDER BY id DESC`,
      { search }
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate, async (req, res, next) => {
  try {
    const result = await query(
      `INSERT INTO clients (full_name, email, phone, city, address)
       VALUES (:full_name, :email, :phone, :city, :address)`,
      req.body
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE clients
       SET full_name = :full_name, email = :email, phone = :phone, city = :city, address = :address
       WHERE id = :id`,
      { ...req.body, id: Number(req.params.id) }
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Cliente no encontrado' });
    return res.json({ id: Number(req.params.id), ...req.body });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM clients WHERE id = :id', { id: Number(req.params.id) });
    if (!result.affectedRows) return res.status(404).json({ message: 'Cliente no encontrado' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
