import express from "express"
import { signup,reset_password,delete_user, 
    verifySignup,
    verify_otp,get_user, user_login ,update_user,forgot_password, user_logout} from "../controllers/userController";
import { validate, validateOwnership } from "../validation/validationMiddleware";
import {  resetPasswordSchema, signupSchema, updateUserSchema, verifyOtpSchema } from "../validation/userValidation";
import { authUser } from "../middleware/authMiddleware";

const router = express.Router()



router.post('/signup', validate(signupSchema), signup);
router.post('/verify-signup', validate(verifyOtpSchema), verifySignup)
router.post('/login', user_login)
router.post('/logout',authUser,user_logout)
router.get('/user-data',authUser, get_user)
router.put('/update-user', authUser,validate(updateUserSchema), 
  update_user)
router.post('/forgot-password', forgot_password)
router.post('/verify-otp', validate(verifyOtpSchema), verify_otp)
router.post('/reset-password', validate(resetPasswordSchema), reset_password)
router.delete('/delete-user',authUser, delete_user)
export default router;