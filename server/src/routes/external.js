import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/suggestions', async (_req, res, next) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const response = await fetch('https://dummyjson.com/products/category/laptops?limit=6', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('No se pudo consultar la API externa');
    const data = await response.json();
    const suggestions = (data.products || []).map((item) => ({
      external_id: item.id,
      name: item.title,
      price: item.price,
      description: item.description,
      category: 'Computadoras',
      stock: item.stock || 5,
      sku: `EXT-${item.id}`,
      image_url: item.thumbnail || ''
    }));
    res.json(suggestions);
  } catch (error) {
    res.json([
      {
        external_id: 'fallback-1',
        name: 'Laptop empresarial sugerida',
        price: 699,
        description: 'Producto de respaldo cuando la API externa no responde.',
        category: 'Computadoras',
        stock: 5,
        sku: 'EXT-FALLBACK-1',
        image_url: ''
      }
    ]);
  }
});

export default router;
