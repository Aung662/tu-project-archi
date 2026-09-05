import multer from 'multer';
import { extname } from 'node:path';
import { env, allowedExtensions } from '../config/env.js';
import { newStorageTarget, PRIVATE_DIR } from '../lib/storage.js';
import { BadRequest } from '../lib/errors.js';

// Map allowed extensions to acceptable MIME types (server-side MIME validation).
const MIME_BY_EXT: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  zip: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
  // image proofs for payments
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
};

function makeUploader(allowExt: string[], maxBytes: number) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PRIVATE_DIR),
    filename: (_req, file, cb) => {
      const { key } = newStorageTarget(file.originalname);
      cb(null, key);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).slice(1).toLowerCase();
      if (!allowExt.includes(ext)) {
        return cb(BadRequest(`File extension .${ext} is not allowed`));
      }
      const okMime = (MIME_BY_EXT[ext] ?? []).includes(file.mimetype);
      if (!okMime) {
        return cb(BadRequest(`File MIME type ${file.mimetype} does not match .${ext}`));
      }
      cb(null, true);
    },
  });
}

/** Full project file upload (admin) — extensions from env. */
export const projectFileUpload = makeUploader(allowedExtensions, env.UPLOAD_MAX_BYTES);

/** Payment proof upload (student) — images only, smaller cap. */
export const paymentProofUpload = makeUploader(['png', 'jpg', 'jpeg', 'pdf'], 5 * 1024 * 1024);

// ── Public project images (gallery + 360° frames) ────────────────────────────
// These are stored as binary IN THE DATABASE (see ProjectImage), so we keep the
// bytes in memory rather than writing to disk. Multiple files per request are
// allowed so an admin can upload a whole 360° frame set in one go.
const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export const projectImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 48 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_MIME.includes(file.mimetype)) {
      return cb(BadRequest(`Unsupported image type ${file.mimetype} (use JPEG, PNG or WebP)`));
    }
    cb(null, true);
  },
});
