import { Router } from 'express';
import { fetchChats, accessChat, createGroup } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';
const router = Router();
router.use(protect);
router.get('/', fetchChats);
router.post('/', accessChat);
router.post('/group', createGroup);
export default router;
