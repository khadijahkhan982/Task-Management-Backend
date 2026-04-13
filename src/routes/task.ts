import express from "express"
import { create_task, get_task_activity_log, assign_task, update_task, get_task, delete_task, change_task_status } from "../controllers/taskController";
import { authUser } from "../middleware/authMiddleware";
import { validate } from "../validation/validationMiddleware";
import { createTaskSchema, updateTaskSchema } from "../validation/taskValidation";

const router = express.Router()

router.post('', authUser, validate(createTaskSchema), create_task);
router.get('', authUser, get_task);
router.put('', authUser, validate(updateTaskSchema), update_task);
router.delete('', authUser, delete_task);


router.post('/user', authUser, assign_task);

router.post('/status', authUser, change_task_status);

router.get('/activity-log', authUser, get_task_activity_log);

export default router;