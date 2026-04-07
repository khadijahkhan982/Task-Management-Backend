import express from "express"
import { signup,reset_password,delete_user, 
    verifySignup,
    verify_otp,get_user, user_login ,update_user,forgot_password, user_logout} from "../controllers/userController";
import { validate } from "../middleware/validation";
import { signupSchema } from "../middleware/userValidation";
import { protect } from "../utils/authMiddleware";

const router = express.Router()



router.post('/signup', validate(signupSchema), signup);
router.post('/verify-signup', verifySignup)
router.post('/login', user_login)
router.post('/logout',protect,user_logout)
router.get('/user-data',protect, get_user)
router.put('/update-user', protect, update_user)
router.post('/forgot-password', forgot_password)
router.post('/verify-otp', verify_otp)
router.post('/reset-password', reset_password)
router.delete('/delete-user', protect, delete_user)
export default router;