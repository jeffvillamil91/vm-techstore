import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const productSchema = Joi.object({
  name: Joi.string().min(3).max(180).required(),
  category: Joi.string().valid('Computadoras', 'Impresoras', 'Almacenamiento', 'Accesorios', 'Servicios').required(),
  price: Joi.number().precision(2).min(0.01).required(),
  stock: Joi.number().integer().min(0).required(),
  sku: Joi.string().min(3).max(45).required(),
  description: Joi.string().allow('').max(500).default(''),
  image_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('').max(600).default('')
});

function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      error.status = 400;
      error.message = error.details.map((detail) => detail.message).join(', ');
      return next(error);
    }
    req.body = value;
    return next();
  };
}

router.get('/', async (req, res, next) => {
  try {
    const search = `%${req.query.search || ''}%`;
    const rows = await query(
      `SELECT id, sku, name, category, price, stock, description, image_url, created_at
       FROM products
       WHERE name LIKE :search OR sku LIKE :search OR category LIKE :search
       ORDER BY id DESC`,
      { search }
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, validate(productSchema), async (req, res, next) => {
  try {
    const result = await query(
      `INSERT INTO products (sku, name, category, price, stock, description, image_url)
       VALUES (:sku, :name, :category, :price, :stock, :description, :image_url)`,
      req.body
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' && req.body.sku.startsWith('EXT-')) {
      const result = await query(
        `UPDATE products
         SET name = :name, category = :category, price = :price, stock = :stock,
             description = :description, image_url = :image_url
         WHERE sku = :sku`,
        req.body
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'Producto externo no encontrado' });
      const [product] = await query(
        `SELECT id, sku, name, category, price, stock, description, image_url, created_at
         FROM products
         WHERE sku = :sku`,
        { sku: req.body.sku }
      );
      return res.json({ ...product, imported: true, updated: true });
    }
    error.status = error.code === 'ER_DUP_ENTRY' ? 409 : error.status;
    error.message = error.code === 'ER_DUP_ENTRY' ? 'El SKU ya existe' : error.message;
    next(error);
  }
});

router.put('/:id', requireAuth, validate(productSchema), async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE products
       SET sku = :sku, name = :name, category = :category, price = :price, stock = :stock, description = :description, image_url = :image_url
       WHERE id = :id`,
      { ...req.body, id: Number(req.params.id) }
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json({ id: Number(req.params.id), ...req.body });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM products WHERE id = :id', { id: Number(req.params.id) });
    if (!result.affectedRows) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
