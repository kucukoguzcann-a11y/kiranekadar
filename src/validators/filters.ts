import { z } from 'zod';

export const analyticsFilterSchema = z.object({
  cityId: z.number().optional(),
  districtId: z.number().optional(),
  neighborhoodId: z.number().optional(),
  propertyType: z.string().optional(),
  roomCount: z.string().optional(),
  minSqm: z.number().optional(),
  maxSqm: z.number().optional(),
  buildingAge: z.string().optional(),
  isFurnished: z.boolean().optional(),
  isInSite: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  rentType: z.string().optional(),
  dateRange: z.enum(['1m', '3m', '6m', '12m']).default('6m'),
});

export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;
