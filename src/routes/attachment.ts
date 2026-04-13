import { authUser } from "../middleware/authMiddleware";
import express from "express"
import { create_attachment, update_attachment, get_attachment, delete_attachment } from "../controllers/attachmentController";
import { upload } from "../utils/upload";
import { validate } from "../validation/validationMiddleware";
import { createAttachmentSchema, updateAttachmentSchema } from "../validation/attachmentValidation";

const router = express.Router()

/**
 * @openapi
 * /api/attachment:
 *   post:
 *     summary: Upload a new attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - projectId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               projectId:
 *                 type: number
 *                 description: ID of the project to attach the file to
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or missing projectId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update an existing attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - projectId
 *               - attachmentId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The new file to replace the existing one
 *               projectId:
 *                 type: number
 *                 description: ID of the project
 *               attachmentId:
 *                 type: string
 *                 description: ID of the attachment to update
 *     responses:
 *       200:
 *         description: File updated successfully
 *       400:
 *         description: No file uploaded or missing fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attachment not found
 *   get:
 *     summary: Get an attachment URL by ID
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the attachment to retrieve
 *     responses:
 *       200:
 *         description: Attachment URL retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attachment not found
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attachmentId
 *             properties:
 *               attachmentId:
 *                 type: string
 *                 description: ID of the attachment to delete
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attachment not found
 */
router.post('', authUser, upload.single("file"), validate(createAttachmentSchema), create_attachment);
router.put('', authUser, upload.single("file"), validate(updateAttachmentSchema), update_attachment);
router.get('', authUser, get_attachment);
router.delete('', authUser, delete_attachment);

export default router;