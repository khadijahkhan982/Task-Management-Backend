import express from "express"
import { protect } from "../utils/authMiddleware"

import { create_comment , update_comment, get_comment, delete_comment, get_all_comments} from "../controllers/commentController"

const router = express.Router()

router.post('/create-comment', protect, create_comment);
router.put('/update-comment', protect, update_comment);
router.get('/get-comment', protect, get_comment);
router.delete('/delete-comment', protect, delete_comment);
router.get('/get-all-comments', protect, get_all_comments);
export default router;