import { v2 as cloudinary } from 'cloudinary';
import { env, cloudinaryConfigured } from '../config/env.js';
import { BadRequest } from './errors.js';

/**
 * Thin Cloudinary wrapper for short project demo videos.
 *
 * Design notes:
 * - Video bytes are NEVER stored in our database. They live on Cloudinary's CDN;
 *   we persist only the delivery URL + public_id (see ProjectVideo model).
 * - Configuration is OPTIONAL. If the CLOUDINARY_* env vars are missing, every
 *   function throws a clear, user-facing BadRequest instead of crashing, and the
 *   rest of the app is unaffected (`cloudinaryConfigured` gates the routes).
 */

let configured = false;
function ensureConfigured() {
  if (!cloudinaryConfigured) {
    throw BadRequest(
      'Video hosting is not configured on this server. Set CLOUDINARY_CLOUD_NAME, ' +
        'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable video uploads.',
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
}

export interface UploadedVideo {
  url: string;
  publicId: string;
  thumbnailUrl: string;
  durationSec: number;
  sizeBytes: number;
  format: string;
}

/**
 * Upload a video buffer to Cloudinary under a per-project folder. Returns the
 * secure URL, public_id and an auto-generated poster (jpg) URL.
 */
export function uploadVideo(buffer: Buffer, projectId: string): Promise<UploadedVideo> {
  ensureConfigured();
  return new Promise<UploadedVideo>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: `tu-archive/projects/${projectId}`,
        // Cap dimensions so huge source files don't blow past the free tier.
        eager: [{ format: 'mp4', quality: 'auto', width: 1280, crop: 'limit' }],
        eager_async: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(BadRequest(error?.message || 'Cloudinary upload failed'));
        }
        // Poster frame: same public_id delivered as a jpg with a middle frame.
        const thumbnailUrl = cloudinary.url(result.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 640, crop: 'limit', quality: 'auto' }],
        });
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl,
          durationSec: Math.round(result.duration ?? 0),
          sizeBytes: result.bytes ?? buffer.length,
          format: result.format ?? '',
        });
      },
    );
    stream.end(buffer);
  });
}

/** Remove a video asset from Cloudinary (best-effort; ignores "not found"). */
export async function deleteVideo(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
}
