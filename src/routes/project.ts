import express from "express"
import { create_project,change_project_status, delete_project,get_project_activity_log,get_project,assign_user_to_project, update_users_projects,update_project } from "../controllers/projectController"
import { authUser } from "../middleware/authMiddleware";
import { validate } from "../validation/validationMiddleware";
import { assignUsersToProjectSchema, createProjectSchema, updateProjectSchema, updateUsersToProjectSchema } from "../validation/projectValidation";


const router = express.Router()


/**
 * @openapi
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - due_date
 *             properties:
 *               name:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *                 
 *     responses:
 *       201:
 *         description: Project created
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the project to retrieve
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: number
 *               name:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('',validate(createProjectSchema), authUser,create_project);
router.put('', validate(updateProjectSchema), authUser, update_project);
router.get('', authUser, get_project);
router.delete('', authUser, delete_project);


/**
 * @openapi
 * /api/project/status:
 *   post:
 *     summary: Change project status
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - status
 *             properties:
 *               projectId:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *     responses:
 *       200:
 *         description: Project status changed successfully
 *       400:
 *         description: Invalid status value or missing fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('/status', authUser, change_project_status);


/**
 * @openapi
 * /api/project/users:
 *   put:
 *     summary: Update users assigned to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userToProjectId
 *               - userId
 *             properties:
 *               userToProjectId:
 *                 type: number
 *               userId:
 *                 type: number
 *     responses: 
 *      200:
 *        description: Users updated successfully
 *      400:
 *        description: Project ID and User ID are required
 *      401:
 *        description: Unauthorized - only admins or managers can update users
 */
router.put('/users',validate(updateUsersToProjectSchema), authUser, update_users_projects);

/**
 * @openapi
 * /api/project/users:
 *   post:
 *     summary: Assign a user to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - userId
 *             properties:
 *               projectId:
 *                 type: number
 *               userId:
 *                 type: number
 *     responses:
 *       201:
 *         description: User assigned successfully
 *       400:
 *         description: Project ID and User ID are required
 *       401:
 *         description: Unauthorized - only admins or managers can assign users
 *       404:
 *         description: Project or user not found
 */
router.post('/users', validate(assignUsersToProjectSchema), authUser, assign_user_to_project);



/**
 * @openapi
 * /api/project/activity-log:
 *   get:
 *     summary: Get project activity logs
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the project to retrieve activity logs for
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/activity-log', authUser, get_project_activity_log);

export default router;