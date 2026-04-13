import express from "express"
import { create_task, get_task_activity_log, assign_task, update_task, get_task, delete_task, change_task_status } from "../controllers/taskController";
import { authUser } from "../middleware/authMiddleware";
import { validate } from "../validation/validationMiddleware";
import { createTaskSchema, updateTaskSchema } from "../validation/taskValidation";

const router = express.Router()

/**
 * @openapi
 * /api/task:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               projectId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.post('', authUser, validate(createTaskSchema), create_task);
router.get('', authUser, get_task);
router.put('', authUser, validate(updateTaskSchema), update_task);
router.delete('', authUser, delete_task);

/**
 * @openapi
 * /api/task/user:
 *   post:
 *     summary: Assign a user to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - userId
 *             properties:
 *               taskId:
 *                 type: number
 *               userId:
 *                 type: number
 *     responses:
 *       201:
 *         description: User assigned successfully
 *       400:
 *         description: Task ID and User ID are required
 *       401:
 *         description: Unauthorized - only admins or managers can assign users
 *       404:
 *         description: Task or user not found
 */
router.post('/user', authUser, assign_task);

/**
 * @openapi
 * /api/task/status:
 *   post:
 *     summary: Change task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - status
 *             properties:
 *               taskId:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *     responses:
 *       200:
 *         description: Task status changed successfully
 *       400:
 *         description: Invalid status value or missing fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.post('/status', authUser, change_task_status);

/**
 * @openapi
 * /api/task/activity-log:
 *   get:
 *     summary: Get task activity logs
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the task to retrieve activity logs for
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/activity-log', authUser, get_task_activity_log);

export default router;