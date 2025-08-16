import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    }
    req.body = result.data.body;
    req.params = result.data.params as any;
    req.query = result.data.query as any;
    next();
  };
}
