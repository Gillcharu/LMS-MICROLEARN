import { IntegrationConnection } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function connectIntegration(req, res, next) {
  const { provider, token } = req.body;
  if (!provider) return next(httpError(400, 'provider is required'));

  const [row] = await IntegrationConnection.findOrCreate({
    where: { userId: req.user.id, provider },
    defaults: { accessToken: token || null, status: 'connected', lastSyncAt: new Date() }
  });

  await row.update({ status: 'connected', accessToken: token || row.accessToken, lastSyncAt: new Date() });
  res.json(row);
}

export async function disconnectIntegration(req, res, next) {
  const provider = req.params.provider;
  const row = await IntegrationConnection.findOne({ where: { userId: req.user.id, provider } });
  if (!row) return next(httpError(404, 'Integration not found'));

  await row.update({ status: 'disconnected' });
  res.json({ message: 'Integration disconnected' });
}

export async function myIntegrations(req, res) {
  const rows = await IntegrationConnection.findAll({ where: { userId: req.user.id }, order: [['updatedAt', 'DESC']] });
  res.json(rows);
}
