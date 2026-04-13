import { authUser } from "../middleware/authMiddleware";
import express from "express"
import { create_attachment, update_attachment, get_attachment, delete_attachment } from "../controllers/attachmentController";
import { upload } from "../utils/upload";
import { validate } from "../validation/validationMiddleware";
import { createAttachmentSchema, updateAttachmentSchema } from "../validation/attachmentValidation";

const router = express.Router()


router.post('', authUser, upload.single("file"), validate(createAttachmentSchema), create_attachment);
router.put('', authUser, upload.single("file"), validate(updateAttachmentSchema), update_attachment);
router.get('', authUser, get_attachment);
router.delete('', authUser, delete_attachment);

export default router;