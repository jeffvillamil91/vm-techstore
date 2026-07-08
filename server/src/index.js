import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import productsRouter from './routes/products.js';
import clientsRouter from './routes/clients.js';
import salesRouter from './routes/sales.js';
import dashboardRouter from './routes/dashboard.js';
import externalRouter from './routes/external.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import { ensureDatabaseTables } from './db/init.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173']);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'VM TechStore API' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/external', externalRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

ensureDatabaseTables()
  .then(() => {
    app.listen(port, () => {
      console.log(`VM TechStore API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos', error);
    process.exit(1);
  });
