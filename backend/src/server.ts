import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, isDatabaseConnected, getConnectionInfo } from './config/database';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import casesRoutes from './routes/cases';
import attributionRoutes from './routes/attribution';
import reportsRoutes from './routes/reports';
import walletsRoutes from './routes/wallets';
import copilotRoutes from './routes/copilot';
import auditLogsRoutes from './routes/auditLogs';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check with Database Status
app.get('/health', (_req, res) => {
  const dbInfo = getConnectionInfo();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbInfo.isConnected,
      mode: dbInfo.mode,
      readyState: dbInfo.readyState,
    },
    version: '1.0.0',
    service: 'vasptrace-backend',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/attribution', attributionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/wallet', walletsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Initialize database connection and start server
const startServer = async () => {
  // Connect DB (non-blocking fallback)
  await connectDatabase();

  const server = app.listen(PORT, () => {
    const dbStatus = isDatabaseConnected() ? '🟢 MongoDB Connected' : '🟡 Fallback Demo Mode';
    console.log(`🚀 VASPTrace API Server running on http://localhost:${PORT} [${dbStatus}]`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
