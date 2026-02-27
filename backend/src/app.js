import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import pathRoutes from './routes/pathRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import liveRoutes from './routes/liveRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import parentAlertRoutes from './routes/parentAlertRoutes.js';
import monetizationRoutes from './routes/monetizationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/parent-alerts', parentAlertRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
