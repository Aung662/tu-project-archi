/**
 * Typed application errors. Thrown anywhere, translated to JSON by the central
 * error handler. Keeps route/service code clean and consistent.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'APP_ERROR',
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const BadRequest = (msg = 'Bad request', details?: unknown) =>
  new AppError(400, msg, 'BAD_REQUEST', details);
export const Unauthorized = (msg = 'Authentication required') =>
  new AppError(401, msg, 'UNAUTHORIZED');
export const Forbidden = (msg = 'You do not have permission to do this') =>
  new AppError(403, msg, 'FORBIDDEN');
export const NotFound = (msg = 'Resource not found') => new AppError(404, msg, 'NOT_FOUND');
export const Conflict = (msg = 'Conflict') => new AppError(409, msg, 'CONFLICT');
