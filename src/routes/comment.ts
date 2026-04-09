import express from "express"
import { authUser } from "../middleware/authMiddleware"

import { create_comment , update_comment, get_comment, delete_comment, get_all_comments} from "../controllers/commentController"
import { validate } from "../validation/validationMiddleware"
import { updateCommentSchema, createCommentSchema } from "../validation/commentValidation"
const router = express.Router()

router.post('', validate(createCommentSchema), authUser, create_comment);
router.put('', validate(updateCommentSchema), authUser, update_comment);
router.get('', authUser, get_comment);
router.delete('', authUser, delete_comment);
router.get('/all', authUser, get_all_comments);
export default router;