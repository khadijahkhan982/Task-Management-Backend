import { z} from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
   
  
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }),
});