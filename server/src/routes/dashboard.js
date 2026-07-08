import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const [summary] = await query(
      `SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM clients) AS clients,
        (SELECT COALESCE(SUM(total), 0) FROM sales) AS revenue,
        (SELECT COUNT(*) FROM products WHERE stock <= 10) AS low_stock`
    );
    const categories = await query(
      `SELECT category, COUNT(*) AS total, COALESCE(SUM(stock), 0) AS units
       FROM products GROUP BY category ORDER BY category`
    );
    res.json({ summary, categories });
  } catch (error) {
    next(error);
  }
});

export default router;
