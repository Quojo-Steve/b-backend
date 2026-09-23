import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';
import { NEWS_UPLOAD_DIR } from '../config/uploads.config';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, NEWS_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new ValidationError('Image must be a JPEG, PNG, WEBP, or GIF file.'));
    return;
  }
  callback(null, true);
}

const singleImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('image');

/**
 * `.single('image')` - expects the file under the form field name
 * "image" in a multipart/form-data request. Only the resulting relative
 * path (see news.routes.ts, where req.file.filename is turned into a
 * `/uploads/news/...` URL) is ever stored in the database - the file
 * itself stays on disk.
 *
 * Wrapping multer's middleware rather than exporting it directly lets us
 * translate its own error type (e.g. LIMIT_FILE_SIZE) into our
 * ValidationError, so it comes back as a 400 with a clear message
 * instead of falling through to a generic 500.
 */
export function uploadNewsImage(req: Request, res: Response, next: NextFunction): void {
  singleImageUpload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError('Image must be 5MB or smaller.'));
      return;
    }
    next(err);
  });
}