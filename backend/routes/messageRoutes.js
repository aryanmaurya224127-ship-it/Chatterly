import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import protect from '../middleware/authMiddleware.js';
const router = Router();
router.use(protect);
router.get('/:chatId', getMessages);
router.post('/', sendMessage);
export default router;
