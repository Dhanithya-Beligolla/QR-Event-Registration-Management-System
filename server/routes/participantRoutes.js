import { Router } from 'express';
import { participantController } from '../controllers/participantController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.get('/', authenticate, participantController.list);
router.post('/', authenticate, participantController.upsert);
router.post('/:id/retoken', authenticate, participantController.retoken);
export default router;
