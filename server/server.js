import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import api from './routes/index.js';
import { logger } from './utils/logger.js';
import { authService } from './services/authService.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173'] }));
app.use(logger);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res)=>res.json({ ok: true }));

app.use('/api/', rateLimit({ windowMs: 60_000, max: 300 }));

app.use('/api', api);

app.use((err, _req, res, _next)=>{
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 5699;

(async ()=>{
  const conn = await connectDB(process.env.MONGO_URI);
  conn.on('error', err => console.error('Mongo error', err));
  await authService.seedAdminIfNone();
  const server = app.listen(port, ()=>console.log(`[server] listening on ${port}`));
  const shutdown = ()=>{
    console.log('Shutting down...');
    server.close(()=>{ conn.close(false, ()=>process.exit(0)); });
    setTimeout(()=>process.exit(1), 10000);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
