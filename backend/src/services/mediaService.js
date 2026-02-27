import { env } from '../config/env.js';

export function buildMediaUrl(key) {
  if (!key) return null;
  return `${env.mediaBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

export function mediaUploadHint() {
  return {
    provider: 's3-compatible',
    note: 'Configure presigned URL upload in production. Current implementation stores URL references only.'
  };
}
