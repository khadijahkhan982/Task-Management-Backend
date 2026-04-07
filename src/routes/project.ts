import express from "express"
import { create_project,change_project_status, delete_project,get_project,assign_user_to_project, update_users_projects,update_project } from "../controllers/projectController"
import { protect } from "../utils/authMiddleware";


const router = express.Router()

router.post('/create-project', protect,create_project);
router.post('/assign-user', protect, assign_user_to_project);
router.put('/update-project', protect, update_project);
router.put('/update-users-projects', protect, update_users_projects);
router.post('/change-project-status', protect, change_project_status);
router.get('/get-project', protect, get_project);
router.delete('/delete-project', protect, delete_project);

export default router;