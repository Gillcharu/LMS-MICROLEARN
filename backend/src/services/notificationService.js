import { Notification } from '../models/index.js';
import { env } from '../config/env.js';

export async function createNotification({ userId, type, title, message }) {
  return Notification.create({ userId, type, title, message });
}

export async function notifyEmailSimulated({ to, subject, body }) {
  // Placeholder for SMTP provider integration.
  console.log(`[email:${env.notificationEmailFrom} -> ${to}] ${subject}\n${body}`);
}
