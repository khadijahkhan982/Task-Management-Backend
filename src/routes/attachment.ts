import { authUser } from "../middleware/authMiddleware";
import express from "express"
import { create_attachment, update_attachment , get_attachment, delete_attachment} from "../controllers/attachmentController";
import { upload } from "../utils/upload";
import { validate } from "../validation/validation";
import { createAttachmentSchema,updateAttachmentSchema } from "../validation/attachmentValidation";

const router = express.Router()

router.post("/attachment", validate(createAttachmentSchema), authUser, upload.single("file"), create_attachment);
router.put("/attachment", validate(updateAttachmentSchema), authUser, upload.single("file"), update_attachment);
router.get("/attachment", authUser, get_attachment);
router.delete("/attachment", authUser, delete_attachment);
export default router;