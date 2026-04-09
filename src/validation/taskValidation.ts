import z from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    priority: z.enum(['low', 'medium', 'high']),
    projectId: z.number(),
   
  }),
});


export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});