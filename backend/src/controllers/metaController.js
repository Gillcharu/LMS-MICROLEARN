import { mediaUploadHint } from '../services/mediaService.js';

export function health(req, res) {
  res.json({ ok: true, service: 'microlearn-api' });
}

export function mediaConfig(req, res) {
  res.json(mediaUploadHint());
}
