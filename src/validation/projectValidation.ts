import z from "zod";


export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    due_date: z.string().datetime().optional()
      .refine((date) => !date || new Date(date) > new Date(), {
        message: "Due date must be in the future",
      }),
  }),
});



export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    due_date: z.string().datetime().optional()
      .refine((date) => !date || new Date(date) > new Date(), {
        message: "Due date must be in the future",
      }),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});


export const assignUsersToProjectSchema = z.object({
  body: z.object({
    projectId: z.number(),
    userId: z.number(),
  }),
});

export const updateUsersToProjectSchema = z.object({
  body: z.object({
    userToProjectId: z.number(),
    userId: z.number(),
  }),
});