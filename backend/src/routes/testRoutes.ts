import { Router } from 'express';
import { startTest, submitResponse, completeTest } from '../controllers/testController';
import { audioUpload } from '../services/fileUploadService';

const router = Router();

router.post('/tests', startTest);
router.post('/tests/:testId/responses', audioUpload.single('audio'), submitResponse);
router.post('/tests/:testId/complete', completeTest);

export default router;
