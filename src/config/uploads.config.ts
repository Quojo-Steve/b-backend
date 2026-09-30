import path from 'path';
import fs from 'fs';

/**
 * Where uploaded news images live on disk. Resolved from the project
 * root (not __dirname) so it points at the same folder whether the app
 * is run via ts-node (src/) or the compiled output (dist/).
 *
 * Lives in config/ (rather than in the multer middleware itself) because
 * both middlewares/upload.middleware.ts (writing files) and
 * services/NewsService.ts (deleting a replaced image) need to agree on
 * the same path.
 */
export const NEWS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'news');
export const PRESS_RELEASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'press-releases');
export const PARTNER_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'partners');

fs.mkdirSync(NEWS_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PRESS_RELEASE_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PARTNER_UPLOAD_DIR, { recursive: true });

/** Public URL prefix these files are served under - see app.ts. */
export const NEWS_UPLOAD_URL_PREFIX = '/uploads/news';
export const PRESS_RELEASE_UPLOAD_URL_PREFIX = '/uploads/press-releases';
export const PARTNER_UPLOAD_URL_PREFIX = '/uploads/partners';