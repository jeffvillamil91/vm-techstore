import { Router } from 'express';
import Joi from 'joi';
import { pool, query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const saleSchema = Joi.object({
  client_id: Joi.number().integer().positive().required(),
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required()
});

router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT s.id, s.quantity, s.unit_price, s.total, s.created_at,
              c.full_name AS client_name, p.name AS product_name
       FROM sales s
       INNER JOIN clients c ON c.id = s.client_id
       INNER JOIN products p ON p.id = s.product_id
       ORDER BY s.id DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { error, value } = saleSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.message });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[product]] = await connection.execute(
      'SELECT id, price, stock FROM products WHERE id = :product_id FOR UPDATE',
      { product_id: value.product_id }
    );
    if (!product) throw Object.assign(new Error('Producto no encontrado'), { status: 404 });
    if (product.stock < value.quantity) throw Object.assign(new Error('Stock insuficiente'), { status: 400 });

    const total = Number(product.price) * value.quantity;
    const [result] = await connection.execute(
      `INSERT INTO sales (client_id, product_id, quantity, unit_price, total)
       VALUES (:client_id, :product_id, :quantity, :unit_price, :total)`,
      { ...value, unit_price: product.price, total }
    );
    await connection.execute(
      'UPDATE products SET stock = stock - :quantity WHERE id = :product_id',
      { quantity: value.quantity, product_id: value.product_id }
    );
    await connection.commit();
    res.status(201).json({ id: result.insertId, ...value, unit_price: product.price, total });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res, next) => {
  return res.status(409).json({
    message: 'La venta ya fue realizada y no se puede borrar. Registre una anulacion controlada si necesita ajustar el inventario.'
  });
});

export default router;
