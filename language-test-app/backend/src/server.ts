import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sessionRoutes from './routes/sessionRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import testRoutes from './routes/testRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import { databaseClient } from './database';

dotenv.config({ path: path.join(process.cwd(), '.env') });

databaseClient.getConnection();

const app = express();
app.set('logger', logger);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', sessionRoutes);
app.use('/api', apiKeyRoutes);
app.use('/api', testRoutes);
app.use('/api', aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
