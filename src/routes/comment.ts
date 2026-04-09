import express from "express"
import { authUser } from "../middleware/authMiddleware"

import { create_comment , update_comment, get_comment, delete_comment, get_all_comments} from "../controllers/commentController"
import { validate } from "../validation/validationMiddleware"
import { updateCommentSchema, createCommentSchema } from "../validation/commentValidation"
const router = express.Router()

router.post('/comment', validate(createCommentSchema), authUser, create_comment);
router.put('/comment', validate(updateCommentSchema), authUser, update_comment);
router.get('/comment', authUser, get_comment);
router.delete('/comment', authUser, delete_comment);
router.get('/comment/all', authUser, get_all_comments);
export default router;