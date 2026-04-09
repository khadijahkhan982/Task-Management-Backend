import express from "express"
import { create_project,change_project_status, delete_project,get_project_activity_log,get_project,assign_user_to_project, update_users_projects,update_project } from "../controllers/projectController"
import { authUser } from "../middleware/authMiddleware";
import { validate } from "../validation/validationMiddleware";
import { assignUsersToProjectSchema, createProjectSchema, updateProjectSchema, updateUsersToProjectSchema } from "../validation/projectValidation";


const router = express.Router()

router.post('',validate(createProjectSchema), authUser,create_project);
router.post('/users', validate(assignUsersToProjectSchema), authUser, assign_user_to_project);
router.put('', validate(updateProjectSchema), authUser, update_project);
router.put('/users',validate(updateUsersToProjectSchema), authUser, update_users_projects);
router.post('/status', authUser, change_project_status);
router.get('', authUser, get_project);
router.delete('', authUser, delete_project);
router.get('/activity-log', authUser, get_project_activity_log);

export default router;