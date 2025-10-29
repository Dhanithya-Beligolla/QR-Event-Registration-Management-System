import { Router } from 'express';
import { outboundController } from '../controllers/outboundController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.post('/send-qr', authenticate, outboundController.sendQR);
router.post('/public/register', outboundController.publicRegister);
export default router;
