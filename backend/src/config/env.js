import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(configDir, '..', '..');
const rawDbPath = process.env.DB_PATH || './data/microlearn.sqlite';
const dbPath = path.isAbsolute(rawDbPath) ? rawDbPath : path.resolve(backendRoot, rawDbPath);

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath,
  mediaBaseUrl: process.env.MEDIA_BASE_URL || 'https://media.microlearn.local',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  notificationEmailFrom: process.env.NOTIFICATION_EMAIL_FROM || 'no-reply@microlearn.app'
};
