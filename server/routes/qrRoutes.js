import { Router } from 'express';
import { qrController } from '../controllers/qrController.js';
const router = Router();
router.get('/:token.png', qrController.pngByToken);
export default router;
