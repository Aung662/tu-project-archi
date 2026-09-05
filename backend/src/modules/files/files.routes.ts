import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params, contentDispositionAttachment } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { projectFileUpload } from '../../middleware/upload.js';
import { extname } from 'node:path';
import { prisma } from '../../lib/prisma.js';
import { BadRequest, Forbidden, NotFound } from '../../lib/errors.js';
import { deletePrivateFile, privateFileExists, resolvePrivatePath, streamPrivateFile } from '../../lib/storage.js';
import { fileMatchesExtension } from '../../lib/fileSignature.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import { audit } from '../../lib/audit.js';

export const filesRouter = Router();

const idParam = z.object({ projectId: z.string().min(1) });

/**
 * GET /api/files/:projectId/download
 * THE critical protected path. Streams the private file only if the user has a
 * PurchaseAccess grant (or is an admin). No public URL ever exists.
 */
filesRouter.get(
  '/:projectId/download',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !project.fileStorageKey) throw NotFound('File not available for this project');

    const isAdmin = req.user!.role === 'ADMIN';
    if (!isAdmin) {
      const access = await prisma.purchaseAccess.findUnique({
        where: { userId_projectId: { userId: req.user!.sub, projectId } },
      });
      if (!access) throw Forbidden('You have not purchased access to this file');
    }

    if (!privateFileExists(project.fileStorageKey)) throw NotFound('Stored file is missing');

    const downloadName = project.fileName || `project-${projectId}`;
    res.setHeader('Content-Type', project.fileMimeType || 'application/octet-stream');
    // RFC 5987 encoding so Burmese/Unicode filenames survive the download.
    res.setHeader('Content-Disposition', contentDispositionAttachment(downloadName));
    if (project.fileSizeBytes) res.setHeader('Content-Length', String(project.fileSizeBytes));

    // SEC-7: audit paid-file downloads — a copyright-sensitive archive needs a
    // trail of who accessed what (uploads were audited; downloads were not).
    void audit({
      actorId: req.user!.sub,
      action: 'FILE_DOWNLOADED',
      entityType: 'Project',
      entityId: projectId,
      metadata: { asAdmin: isAdmin },
    });

    streamPrivateFile(project.fileStorageKey).pipe(res);
  }),
);

/**
 * POST /api/files/:projectId/upload  (admin only)
 * Attaches/replaces the paid full file for a project. Stored privately.
 */
filesRouter.post(
  '/:projectId/upload',
  requireAuth,
  requireAdmin,
  uploadLimiter,
  validate({ params: idParam }),
  projectFileUpload.single('file'),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const file = req.file;
    if (!file) throw NotFound('No file uploaded');

    // HARDENING (S5): verify the real magic bytes match the extension. Client
    // Content-Type + filename were already checked by multer, but both are
    // spoofable — this confirms the actual file contents.
    const ext = extname(file.originalname).slice(1).toLowerCase();
    if (!fileMatchesExtension(resolvePrivatePath(file.filename), ext)) {
      await deletePrivateFile(file.filename);
      throw BadRequest(`Uploaded file contents do not match a valid .${ext} file`);
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      await deletePrivateFile(file.filename);
      throw NotFound('Project not found');
    }

    // Replace old file if present.
    if (project.fileStorageKey) await deletePrivateFile(project.fileStorageKey);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        fileName: file.originalname,
        fileStorageKey: file.filename,
        fileSizeBytes: file.size,
        fileMimeType: file.mimetype,
      },
    });

    await audit({
      actorId: req.user!.sub,
      action: 'PROJECT_FILE_UPLOADED',
      entityType: 'Project',
      entityId: projectId,
      metadata: { fileName: file.originalname, size: file.size },
    });

    res.status(201).json(
      ok({ projectId, fileName: updated.fileName, fileSizeBytes: updated.fileSizeBytes }),
    );
  }),
);
