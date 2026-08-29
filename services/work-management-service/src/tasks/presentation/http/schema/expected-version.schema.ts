import { z } from 'zod';
export const expectedVersionSchema = z.object({ expectedVersion: z.number().int().positive() });
export type ExpectedVersionInput = z.infer<typeof expectedVersionSchema>;
