import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.get('/validate/:token', attendanceController.validate);
router.post('/mark', attendanceController.mark);
router.get('/', authenticate, attendanceController.list);
export default router;
