import { z } from 'zod';

export const createMonitorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Must be a valid URL'),
  intervalMinutes: z.number().int().min(1).max(60).default(5),
});

export const updateMonitorSchema = createMonitorSchema.partial();