import { z } from 'zod';

export const tripSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Trip name is required.')
      .max(200, 'Trip name cannot exceed 200 characters.'),
    description: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string().min(1, 'End date is required.'),
    total_budget: z.coerce
      .number({ invalid_type_error: 'Budget must be a valid number.' })
      .min(0, 'Total budget cannot be negative.'),
    cover_image: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date.',
      path: ['end_date'],
    }
  );

export type TripFormData = z.infer<typeof tripSchema>;
