import { query } from './pool.js';

export async function ensureDatabaseTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      cedula VARCHAR(10) NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      phone VARCHAR(10) NOT NULL,
      email VARCHAR(120) NOT NULL,
      address VARCHAR(180),
      status ENUM('pendiente', 'confirmado', 'despachado', 'cancelado') NOT NULL DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      dispatched_at TIMESTAMP NULL,
      CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    )
  `);

  const [indexExists] = await query(
    `SELECT COUNT(*) AS total
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'orders'
       AND index_name = 'idx_orders_status'`
  );

  if (!Number(indexExists.total)) {
    await query('CREATE INDEX idx_orders_status ON orders(status)');
  }
}
