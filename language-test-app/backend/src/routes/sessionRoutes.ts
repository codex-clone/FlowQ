import { Router } from 'express';
import { createSession, getSession } from '../controllers/sessionController';

const router = Router();

router.post('/sessions', createSession);
router.get('/sessions/:sessionId', getSession);

export default router;
