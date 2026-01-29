import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT } from './Constant.js';
import { deviceTracker } from './Middlewares/deviceTracker.js';
import taskRoutes from './Routes/taskRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'file://'], // Vite dev server, API calls from Electron, and file protocol
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Device tracking middleware
app.use(deviceTracker);

// Routes
app.use('/api', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Notes Maker API is running' });
});

export default app;
