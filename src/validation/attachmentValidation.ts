import z from "zod";

export const createAttachmentSchema = z.object({
  body: z.object({
    projectId: z.coerce.number({
      message: "projectId must be a number or a numeric string",
    }),
  }),
});

export const updateAttachmentSchema = z.object({
  body: z.object({
    attachmentId: z.coerce.number({ message: "Attachment ID is required" }),
    projectId: z.coerce.number().optional(),
  }),
});