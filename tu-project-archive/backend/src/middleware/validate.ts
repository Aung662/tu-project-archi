import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Validates and coerces request parts against Zod schemas. Replaces the raw
 * values with the parsed/typed values so handlers get clean, trusted input.
 */
export const validate = (schemas: {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);

      // Express 5 exposes `req.query` and `req.params` via prototype GETTERS, so
      // `Object.assign(req.query, parsed)` silently fails to persist coerced
      // values (e.g. a Zod `z.coerce.number()` stays a string, breaking Prisma
      // `take`/`skip`). Redefine them as own properties so handlers read the
      // parsed/typed values.
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.defineProperty(req, 'params', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
