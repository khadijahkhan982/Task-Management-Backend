import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { Action, HttpStatusCode, Role, Statuses } from "../utils/enum";
import { create_json_response, handleError } from "../utils/helper";
import { APIError } from "../utils/api-error";
import { encrypt_password, generateAuthToken, verifyAndDecodeJWT } from "../utils/auth-helpers";
import redisClient from "../config/redis";
import { sendOTPEmail, sendOTPForPasswordReset } from "../utils/email-helper";
import { queryRunnerFunc } from "../utils/queryRunner";
import bcrypt from "bcrypt";
import { UnauthenticatedError } from "../utils/unauthenticated-error";
import { UserSessions } from "../entities/UserSessions";
import { EntityNotFoundError } from "typeorm";
import { Project } from "../entities/Project";
import { Project_Users } from "../entities/Project_Users";
import { Activity } from "../entities/Activity";
import { Status } from "../entities/Status";




interface AuthRequest extends Request {
  authenticatedUserId?: number;
}


const create_project = async (req: AuthRequest, res: Response) => {
  const { name, due_date } = req.body;
  const authUserId = req.authenticatedUserId; 

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required to create a project.");
  }

  try {
    const project = Project.create({
      name,
      due_date
    });
    const savedProject = await project.save();

   
    const projectUserEntry = Project_Users.create({
      project: savedProject,
      user: { id: authUserId } as any, 
    });
    
    await projectUserEntry.save();
    const activity = Activity.create({
      action: Action.CREATED, 
      user: { id: authUserId } as any,
      project: savedProject,
      description: `Project "${savedProject.name}" was created by user ${authUserId}.`
    });
    await activity.save();

    return res.status(HttpStatusCode.CREATED).json(
      create_json_response(
        { project: savedProject }, 
        true, 
        "Project created and assigned to you."
      )
    );
  } catch (error) {
    return handleError(error, res, 'project-creation');
  }
};


const assign_user_to_project = async (req: AuthRequest, res: Response) => {
  const { projectId, userId } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required.");
  } 

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    
    if (!currentUser || currentUser.role !== Role.MANAGER) {
      throw new APIError(
        "UNAUTHORIZED", 
        HttpStatusCode.UNAUTHORIZED, 
        true, 
        "Access denied. Only managers can assign users to projects.",
        "Access denied. Only managers can assign users to projects."
      );
    }

    const managerAssignment = await Project_Users.findOne({
      where: { 
        project: { id: projectId }, 
        user: { id: authUserId } 
      }
    });

    if (!managerAssignment) {
      throw new APIError(
        "UNAUTHORIZED",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Access denied. You must be a member of this project to assign others.",
        "Access denied. You must be a member of this project to assign others."
      );
    }

   
    const project = await Project.findOneBy({ id: projectId });
    if (!project) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.", "Project not found.");
    }

    const userToAssign = await User.findOneBy({ id: userId });
    if (!userToAssign) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "User to be assigned not found.", "User to be assigned not found.");
    }

    const existingAssignment = await Project_Users.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });

    if (existingAssignment) {
      throw new APIError("Conflict", HttpStatusCode.CONFLICT, true, "User is already assigned to this project.", "User is already assigned to this project.");
    }

    const projectUserEntry = Project_Users.create({
      project,
      user: userToAssign,
    });
    await projectUserEntry.save();

    const activity = Activity.create({
      action: Action.ASSIGNED,
      user: { id: authUserId } as any,
      project: { id: projectId } as any,
      description: `Manager ${currentUser.name} assigned ${userToAssign.name} to "${project.name}".`
    });
    await activity.save();

    return res.status(HttpStatusCode.OK).json(
      create_json_response({ assignment: projectUserEntry }, true, "User assigned successfully.")
    );

  } catch (error) {
    return handleError(error, res, 'assign-user-to-project');
  }
};



const update_project = async (req: AuthRequest, res: Response) => {

  const { projectId, name, due_date } = req.body;

  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required to update a project.");
  }

  try {
    const project = await Project.findOneBy({ id: projectId });
    if (!project) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.", "Project not found.");
    }

    const userAssignment = await Project_Users.findOne({
      where: { project: { id: projectId }, user: { id: authUserId } }
    });

    if (!userAssignment) {
      throw new APIError(
        "UNAUTHORIZED",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Access denied. You must be a member of this project to update it.",
        "Access denied. You must be a member of this project to update it."
      );
    }

    if (name) project.name = name;
    if (due_date) project.due_date = due_date;

    const updatedProject = await project.save();

    const activity = Activity.create({
      action: Action.UPDATED,
      user: { id: authUserId } as any,
      project,
      description: `Project "${project.name}" was updated by user ${authUserId}.`
    });
    await activity.save();  
    return res.status(HttpStatusCode.OK).json(
      create_json_response({ assignment: updatedProject }, true, "Project updated successfully.")
    );  
  } catch (error) {
    return handleError(error, res, 'update-project');
  }
};




const update_users_projects = async (req: AuthRequest, res: Response) => {
  const { userToProjectId, userId } = req.body; 
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required.");
  }

  try {

    const targetAssignment = await Project_Users.findOne({
      where: { userToProjectID: userToProjectId },
      relations: ["project", "user"]
    });

    if (!targetAssignment) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true,
         "Assignment entry not found.",
        "Assignment entry not found."
      );
    }

    const currentProjectId = targetAssignment.project.id;
    const previousUserName = targetAssignment.user?.name || "Unknown User";
    const previousUserId = targetAssignment.user?.id;
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser || currentUser.role !== Role.MANAGER) {
      throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true,
         "Only managers can update assignments.",
        "Only managers can update assignments."
      );
    }

    const managerAssignment = await Project_Users.findOne({
      where: { 
        project: { id: currentProjectId }, 
        user: { id: authUserId } 
      }
    });

    if (!managerAssignment) {
      throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true,
         "Access denied. You must be a member of this project.",
        "Access denied. You must be a member of this project."
      );
    }

    const newUser = await User.findOneBy({ id: userId });
    if (!newUser) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true,
         "The new user you are trying to assign does not exist.",
         "The new user you are trying to assign does not exist.");
    }

   
    targetAssignment.user = newUser;
    await targetAssignment.save();

    const activity = Activity.create({
      action: Action.UPDATED,
      user: { id: authUserId } as any,
      project: { id: currentProjectId } as any,
      description: `Manager ${currentUser.name} replaced user ${previousUserName} id:${previousUserId} on project "${targetAssignment.project.name}" with ${newUser.name} id:${newUser.id}.`
    });
    await activity.save();

    return res.status(HttpStatusCode.OK).json(
      create_json_response(
        { updatedAssignment: targetAssignment }, 
        true, 
        "User assignment updated successfully."
      )
    );

  } catch (error) {
    return handleError(error, res, 'update-users-projects');
  }
};




const get_project = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required to view project details.");
  }

  try {
    const project = await Project.findOne({
      where: { id: Number(projectId) },
      relations: ["projectUsers", "projectUsers.user"],
      select: {
        id: true,
        name: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        projectUsers: {
          userToProjectID: true, 
          user: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }}});

    if (!project) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.", "Project not found.");
    }

    const userAssignment = await Project_Users.findOne({
      where: { project: { id: Number(projectId) }, user: { id: authUserId } }
    });

    if (!userAssignment) {
      throw new APIError(
        "UNAUTHORIZED",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Access denied. You must be a member of this project to view its details.",
        "Access denied. You must be a member of this project to view its details."
      );
    }

    return res.status(HttpStatusCode.OK).json(
      create_json_response({ project }, true, "Project details retrieved successfully.")
    );
  } catch (error) {
    return handleError(error, res, 'get-project');
  }
};



const delete_project = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.body;
  const authUserId = req.authenticatedUserId;

  try {
    const project = await Project.findOneBy({ id: projectId });
    const currentUser = await User.findOneBy({ id: authUserId });

    if (!project) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.");
    }

    if (currentUser?.role !== Role.MANAGER) {
      throw new APIError("Forbidden", HttpStatusCode.UNAUTHORIZED, true, "Only managers can delete projects.");
    }
    const userAssignment = await Project_Users.findOneBy({ 
      project: { id: projectId }, 
      user: { id: authUserId } 
    });

    if (!userAssignment) {
      throw new APIError("Forbidden", HttpStatusCode.UNAUTHORIZED, true, "You must be a member of this project to delete it.");
    }

    const activity = Activity.create({
      action: Action.DELETED,
      user: { id: authUserId } as any,
      project: { id: projectId } as any,
      description: `Project "${project.name}" (ID: ${projectId}) was deleted by Manager ${currentUser.name}.`
    });
    await activity.save();

    await Project.remove(project);

    return res.status(HttpStatusCode.OK).json(
      create_json_response({}, true, "Project and all related assignments deleted successfully.")
    );
  } catch (error) {
    return handleError(error, res, 'delete-project');
  } 
};


const change_project_status = async (req: AuthRequest, res: Response) => {
  const { projectId, status, position } = req.body;
  const authUserId = req.authenticatedUserId;

if (!authUserId) {
      throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "Authentication required.","Authentication required.");
    }
if (!projectId || !status) {
      throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true,
         "Task ID and status are required.","Task ID and status are required.");
    }
    if(status!== Statuses.TODO && status!== Statuses.IN_PROGRESS && status!== Statuses.DONE){
        throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true,
        "Invalid status value. Only allowed values are 'todo', 'in_progress', 'done'.",
        "Invalid status value. Only allowed values are 'todo', 'in_progress', 'done'.");
        }
  try {
  
      const updatedStatus = await queryRunnerFunc(async (manager) => {
        const project = await manager.findOne(Project, { 
          where: { id: projectId }
        });
  
        if (!project) {
          throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.","Project not found.");
        }
  
        const projectMembers = await manager.find(Project_Users, {
          where: [
              { project: { id: projectId }, user: { id: authUserId } }
          ],
          relations: ["user"]
        });
        if (projectMembers.length === 0) {
          throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, 
            "Only project members can change project status.","Only project members can change project status.");
        }
  
        const newStatus = manager.create(Status, {
          status,
          position,
          user: {id:authUserId} as any,
          project: { id: projectId } as any
        });
        const savedStatus = await manager.save(newStatus);
  
        const activity = manager.create(Activity, {
          action: Action.STATUS_CHANGED,
          user: { id: authUserId } as any,
          project: { id: projectId } as any,
          description: `Project "${project.name}" status changed to "${status}" by user ${authUserId}.`
        });
        await manager.save(activity);
  
        return savedStatus;
      });
  
      return res.status(HttpStatusCode.OK).json(
        create_json_response({ status: updatedStatus }, true, "Project status changed successfully.")
      );
    } catch (error: any) {
      return handleError(error, res, "change-project-status");
    } 
  };
  
  


export { create_project ,assign_user_to_project,change_project_status, update_project, delete_project, update_users_projects, get_project};