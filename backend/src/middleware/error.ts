import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { isProd } from '../config/env.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err.flatten() },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Malformed JSON body (thrown by express.json body-parser) → 400, not 500.
  const anyErr = err as { code?: string; message?: string; type?: string; status?: number };
  if (err instanceof SyntaxError && anyErr.status === 400 && 'body' in (err as object)) {
    res.status(400).json({
      success: false,
      error: { code: 'MALFORMED_JSON', message: 'Request body is not valid JSON' },
    });
    return;
  }

  // Multer errors expose a `code` string
  if (anyErr?.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'Uploaded file exceeds the size limit' },
    });
    return;
  }
  if (anyErr?.code === 'LIMIT_FILE_COUNT' || anyErr?.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_REJECTED', message: 'Unexpected or too many files in upload' },
    });
    return;
  }

  // Prisma known request errors → sensible HTTP codes instead of a blanket 500.
  // P2002 unique constraint, P2025 record not found, P2003 FK constraint.
  const prismaCode = (err as { code?: string })?.code;
  if (typeof prismaCode === 'string' && /^P\d{4}$/.test(prismaCode)) {
    const map: Record<string, { status: number; code: string; message: string }> = {
      P2002: { status: 409, code: 'CONFLICT', message: 'A record with these unique values already exists' },
      P2025: { status: 404, code: 'NOT_FOUND', message: 'Record not found' },
      P2003: { status: 409, code: 'FK_CONSTRAINT', message: 'Related records prevent this operation' },
    };
    const mapped = map[prismaCode];
    if (mapped) {
      res.status(mapped.status).json({ success: false, error: { code: mapped.code, message: mapped.message } });
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      ...(isProd ? {} : { details: anyErr?.message }),
    },
  });
};
