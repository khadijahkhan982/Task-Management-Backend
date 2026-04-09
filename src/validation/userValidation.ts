import { z } from 'zod';

const nameSchema = z.string().min(2, "Name is too short");
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");


export const signupSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});



export const resetPasswordSchema = z.object({
  body: z.object({

    new_password: passwordSchema,
  }),
});


export const updateUserSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    role: z.string().optional(), 
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }),
});