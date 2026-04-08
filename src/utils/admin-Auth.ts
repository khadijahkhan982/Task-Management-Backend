import { Project_Users } from "../entities/Project_Users";
import { Role } from "./enum";

export const isAuthorized = async (userId: number, projectId: number, userRole: Role) => {
  if (userRole === Role.ADMIN) return true;
  const assignment = await Project_Users.findOneBy({ 
    project: { id: projectId }, 
    user: { id: userId } 
  });
  return !!assignment;
}; 