import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';
import { startCronJobs } from './cron';

// Routes
import authRoutes from './routes/auth.routes';
import fixtureRoutes from './routes/fixture.routes';
import leagueRoutes from './routes/league.routes';
import betRoutes from './routes/bet.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Middleware
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use(authRoutes);
app.use(fixtureRoutes);
app.use(leagueRoutes);
app.use(betRoutes);
app.use(adminRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info(`MoneyLab API running on port ${env.PORT}`);
  startCronJobs();
});

export default app;
