import express from "express"
import { authUser } from "../middleware/authMiddleware"

import { create_comment ,get_comment_activity_log, update_comment, get_comment, delete_comment, get_all_comments} from "../controllers/commentController"
import { validate } from "../validation/validationMiddleware"
import { updateCommentSchema, createCommentSchema } from "../validation/commentValidation"
const router = express.Router()


/**
 * @openapi
 * /api/comment:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - taskId
 *             properties:
 *               comment:
 *                 type: string
 *               taskId:
 *                 type: number             
 *     responses:
 *       201:
 *         description: Comment created
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: commentId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the comment to retrieve
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.post('', validate(createCommentSchema), authUser, create_comment);
router.put('', validate(updateCommentSchema), authUser, update_comment);
router.get('', authUser, get_comment);
router.delete('', authUser, delete_comment);




/**
 * @openapi
 * /api/comment/all:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the task to retrieve comments for
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/all', authUser, get_all_comments);

/**
 * @openapi
 * /api/comment/activity-log:
 *   get:
 *     summary: Get activity log for a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: commentId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the comment to retrieve activity logs for
 *     responses:
 *       200:
 *         description: Activity log retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.get('/activity-log', authUser, get_comment_activity_log);
export default router;