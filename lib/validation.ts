
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
  }).int().positive(),
});

export const createMessageSchema = z.object({
  content: z.string().trim().max(4000, "Message is too long").optional(),
  fileUrls: z.array(z.string().url()).max(10, "Too many attachments").optional(),
  channelId: z.coerce.number().int().positive(),
}).refine(data => data.content || (data.fileUrls && data.fileUrls.length > 0), {
  message: "Either text content or a file must be provided",
  path: ["content"] 
});


export type CreateClassValues = z.infer<typeof createClassSchema>;
export type CreateChannelValues = z.infer<typeof createChannelSchema>;
