
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Cannot be empty"),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const createClassSchema = z.object({
  className: z.string().trim().min(1, "Class name cannot be empty"),
  subject: z.string().trim().min(1, "Subject cannot be empty"),
  description: z.string().trim().min(1, "Description cannot be empty"),
  imageUrl: z.string().trim().min(1, "Image URL cannot be empty"),
});

export const createChannelSchema = z.object({
  name: z.string().trim().min(1, "Channel name cannot be empty"),
  classId: z.coerce.number({
    required_error: "Class ID is required",
    invalid_type_error: "Class ID must be a number",
  }),
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty"),
  userId: z.coerce.string(),
  channelId: z.coerce.number(),
});


export type CreateClassValues = z.infer<typeof createClassSchema>;
export type CreateChannelValues = z.infer<typeof createChannelSchema>;
