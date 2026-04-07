import express from "express"
import { create_task, assign_task , update_task, get_task, delete_task, change_task_status} from "../controllers/taskController";
import { protect } from "../utils/authMiddleware";



const router = express.Router()

router.post('/create-task', protect, create_task);
router.post('/assign-task', protect, assign_task);
router.put('/update-task', protect, update_task);
router.get('/get-task', protect, get_task);
router.delete('/delete-task', protect, delete_task);
router.post('/change-task-status', protect, change_task_status);


export default router;