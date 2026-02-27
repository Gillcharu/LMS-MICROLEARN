import { Router } from 'express';
import { health, mediaConfig } from '../controllers/metaController.js';

const router = Router();

router.get('/health', health);
router.get('/media', mediaConfig);

export default router;
