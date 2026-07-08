import { Router } from 'express';
import Joi from 'joi';
import { pool, query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const orderSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  cedula: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'La cedula debe tener 10 numeros'
  }),
  full_name: Joi.string().min(3).max(120).required(),
  phone: Joi.string().pattern(/^09[0-9]{8}$/).required().messages({
    'string.pattern.base': 'El celular debe tener 10 numeros y empezar con 09'
  }),
  email: Joi.string().email().max(120).required(),
  address: Joi.string().allow('').max(180)
});

const statusSchema = Joi.object({
  status: Joi.string().valid('pendiente', 'confirmado', 'despachado', 'cancelado').required()
});

router.post('/', async (req, res, next) => {
  const { error, value } = orderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details.map((detail) => detail.message).join(', ') });

  try {
    const [product] = await query(
      'SELECT id, name, price, stock FROM products WHERE id = :product_id',
      { product_id: value.product_id }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (Number(product.stock) < value.quantity) return res.status(400).json({ message: 'Stock insuficiente para crear el pedido' });

    const total = Number(product.price) * value.quantity;
    const result = await query(
      `INSERT INTO orders
       (product_id, quantity, unit_price, total, cedula, full_name, phone, email, address, status)
       VALUES (:product_id, :quantity, :unit_price, :total, :cedula, :full_name, :phone, :email, :address, 'pendiente')`,
      { ...value, unit_price: product.price, total }
    );
    res.status(201).json({ id: result.insertId, ...value, product_name: product.name, unit_price: product.price, total, status: 'pendiente' });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT o.id, o.quantity, o.unit_price, o.total, o.cedula, o.full_name, o.phone,
              o.email, o.address, o.status, o.created_at, o.dispatched_at, p.name AS product_name
       FROM orders o
       INNER JOIN products p ON p.id = o.product_id
       ORDER BY o.id DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  const { error, value } = statusSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.message });

  const id = Number(req.params.id);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[order]] = await connection.execute(
      `SELECT o.id, o.product_id, o.quantity, o.status, p.stock
       FROM orders o
       INNER JOIN products p ON p.id = o.product_id
       WHERE o.id = :id
       FOR UPDATE`,
      { id }
    );
    if (!order) throw Object.assign(new Error('Pedido no encontrado'), { status: 404 });
    if (order.status === 'despachado') throw Object.assign(new Error('El pedido despachado ya no se puede cambiar'), { status: 409 });
    if (order.status === 'cancelado') throw Object.assign(new Error('El pedido cancelado ya no se puede cambiar'), { status: 409 });

    if (value.status === 'despachado') {
      if (Number(order.stock) < Number(order.quantity)) {
        throw Object.assign(new Error('Stock insuficiente para despachar el pedido'), { status: 400 });
      }
      await connection.execute(
        'UPDATE products SET stock = stock - :quantity WHERE id = :product_id',
        { quantity: order.quantity, product_id: order.product_id }
      );
      await connection.execute(
        `UPDATE orders
         SET status = 'despachado', dispatched_at = CURRENT_TIMESTAMP
         WHERE id = :id`,
        { id }
      );
    } else {
      await connection.execute(
        'UPDATE orders SET status = :status WHERE id = :id',
        { status: value.status, id }
      );
    }

    await connection.commit();
    res.json({ id, status: value.status });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
