import z from "zod";




export const createCommentSchema = z.object({
  body: z.object({
    comment: z.string().min(1).max(500),
    taskId: z.number(),
  }),
});



export const updateCommentSchema = z.object({
  body: z.object({
    comment: z.string().min(1).max(500),
    commentId: z.number(),
  }),
});