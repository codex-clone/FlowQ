import { Router } from 'express';
import { generateContent, evaluateResponse } from '../controllers/aiController';

const router = Router();

router.post('/ai/generate-content', generateContent);
router.post('/ai/evaluate', evaluateResponse);

export default router;
