import express from "express"
import { create_task, assign_task , update_task, get_task, delete_task, change_task_status} from "../controllers/taskController";
import { authUser } from "../middleware/authMiddleware";
import { validate } from "../validation/validationMiddleware";
import { createTaskSchema, updateTaskSchema } from "../validation/taskValidation";



const router = express.Router()

router.post('/task', authUser,validate(createTaskSchema), create_task);
router.post('/task/user', authUser, validate(updateTaskSchema), assign_task);
router.put('/task', authUser, update_task);
router.get('/task', authUser, get_task);
router.delete('/task', authUser, delete_task);
router.post('/task/status', authUser, change_task_status);

export default router;