import { z } from 'zod';

export function getJwtSecret(): string {
  const parsed = z.string().min(1).safeParse(process.env.JWT_SECRET);
  if (!parsed.success) {
    throw new Error('Missing JWT_SECRET (required for auth)');
  }

  return parsed.data;
}
