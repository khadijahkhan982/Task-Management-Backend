import { protect } from "../utils/authMiddleware";
import express from "express"
import { create_attachment, update_attachment , get_attachment, delete_attachment} from "../controllers/attachmentController";
import { upload } from "../utils/upload";

const router = express.Router()

router.post("/create-attachments", protect, upload.single("file"), create_attachment);
router.put("/update-attachments", protect, upload.single("file"), update_attachment);
router.get("/get-attachment", protect, get_attachment);
router.delete("/delete-attachment", protect, delete_attachment);
export default router;