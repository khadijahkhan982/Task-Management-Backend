import z from "zod";





export const createAttachmentSchema = z.object({
  body: z.object({
    taskId: z.number(),
  }),
});


export const updateAttachmentSchema = z.object({
  body: z.object({
    attachmentId: z.number(),
    taskId: z.number().optional(),
  
  }),
});
