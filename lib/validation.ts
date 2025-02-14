import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Cannot be empty"),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const createClassSchema = z.object({
  className: z.string().trim().min(1, "Class name cannot be empty"),
  subject: z.string().trim().min(1, "Subject cannot be empty"),
  description: z.string().trim().min(1, "Description cannot be empty"),
});

export type CreateClassValues = z.infer<typeof createClassSchema>;
