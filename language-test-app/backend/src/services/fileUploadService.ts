import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { AppError } from '../utils/errors';

const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedOriginal = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${sanitizedOriginal}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('audio/')) {
    cb(new AppError('Only audio files are allowed', 400));
    return;
  }
  cb(null, true);
};

export const audioUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
