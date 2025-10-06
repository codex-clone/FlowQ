import { Router } from 'express';
import { deleteApiKey, getApiKeys, saveApiKey } from '../controllers/apiKeyController';

const router = Router();

router.post('/api-keys', saveApiKey);
router.get('/api-keys/:sessionId', getApiKeys);
router.delete('/api-keys/:keyId', deleteApiKey);

export default router;
