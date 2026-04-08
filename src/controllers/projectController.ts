import { Request, Response } from "express";
import { User } from "../entities/User";
import { Action, HttpStatusCode, Role, Statuses } from "../utils/enum";
import { create_json_response, handleError } from "../utils/helper";
import { APIError } from "../utils/api-error";
import { queryRunnerFunc } from "../utils/queryRunner";
import { UnauthenticatedError } from "../utils/unauthenticated-error";
import { Project } from "../entities/Project";
import { Project_Users } from "../entities/Project_Users";
import { Activity } from "../entities/Activity";
import { Status } from "../entities/Status";
import { isAuthorized } from "../utils/admin-Auth";




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

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) throw new UnauthenticatedError("User not found.");

    const isAdmin = currentUser.role === Role.ADMIN;
    const isManager = currentUser.role === Role.MANAGER;

    if (!isAdmin && !isManager) {
      throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true, "Only admins or managers can assign users.",
        "Only admins or managers can assign users.");
    }

    if (!isAdmin) {
      const hasAccess = await isAuthorized(Number(authUserId), projectId, currentUser.role);
      if (!hasAccess) throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true, "You must be a project member.", "You must be a project member.");
    }

    const project = await Project.findOneBy({ id: projectId });
    const userToAssign = await User.findOneBy({ id: userId });
    if (!project || !userToAssign) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project or User not found.","Project or User not found.");

    const existingAssignment = await Project_Users.findOneBy({ project: { id: projectId }, user: { id: userId } });
    if (existingAssignment) throw new APIError("Conflict", HttpStatusCode.CONFLICT, true, "User already assigned.", "User already assigned.");

    const projectUserEntry = await Project_Users.create({ project, user: userToAssign }).save();

    await Activity.create({
      action: Action.ASSIGNED,
      user: { id: authUserId } as any,
      project: { id: projectId } as any,
      description: `${currentUser.role} ${currentUser.name} assigned ${userToAssign.name} to "${project.name}".`
    }).save();

    return res.status(HttpStatusCode.OK).json(create_json_response({ assignment: projectUserEntry }, true, "User assigned successfully."));
  } catch (error) {
    return handleError(error, res, 'assign-user-to-project');
  }
};


const update_project = async (req: AuthRequest, res: Response) => {

  const { projectId, name, due_date } = req.body;
  const authUserId = req.authenticatedUserId;

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) throw new UnauthenticatedError("Authentication required.");

    const project = await Project.findOneBy({ id: projectId });
    if (!project) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.");

    const hasAccess = await isAuthorized(Number(authUserId), projectId, currentUser.role);
    if (!hasAccess) throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true, "Access denied.","Access denied.");
if (name) project.name = name;
    if (due_date) project.due_date = due_date;
    await project.save();

    await Activity.create({
      action: Action.UPDATED,
      user: { id: authUserId } as any,
      project,
      description: `Project ${project.name} updated by ${currentUser.role} ${authUserId}.`
    }).save();

    return res.status(HttpStatusCode.OK).json(create_json_response({ project }, true, "Project updated."));
  } catch (error) {
    return handleError(error, res, 'update-project');
  }
};
    





const update_users_projects = async (req: AuthRequest, res: Response) => {
  const { userToProjectId, userId } = req.body; 
  const authUserId = req.authenticatedUserId;

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) throw new UnauthenticatedError("Auth required.");

    const targetAssignment = await Project_Users.findOne({
      where: { userToProjectID: userToProjectId },
      relations: ["project", "user"]
    });
    if (!targetAssignment) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Assignment not found.","Assignment not found.");

    const isAdmin = currentUser.role === Role.ADMIN;
    const isManager = currentUser.role === Role.MANAGER;

    if (!isAdmin && !isManager) throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true, "Insufficient role.","Insufficient role.");

    if (!isAdmin) {
      const hasAccess = await isAuthorized(Number(authUserId), targetAssignment.project.id, currentUser.role);
      if (!hasAccess) throw new APIError("UNAUTHORIZED", HttpStatusCode.UNAUTHORIZED, true, "Access denied.");
    }

    const newUser = await User.findOneBy({ id: userId });
    if (!newUser) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "New user not found.","New user not found.");

    const prevName = targetAssignment.user?.name;
    targetAssignment.user = newUser;
    await targetAssignment.save();

    await Activity.create({
      action: Action.UPDATED,
      user: { id: authUserId } as any,
      project: targetAssignment.project,
      description: `${currentUser.role} replaced ${prevName} with ${newUser.name}.`
    }).save();

    return res.status(HttpStatusCode.OK).json(create_json_response({ updatedAssignment: targetAssignment }, true, "Assignment updated."));
  } catch (error) {
    return handleError(error, res, 'update-users-projects');
  }
};



const get_project = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new UnauthenticatedError("Authentication required.");
  }

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) {
      throw new UnauthenticatedError("User not found.");
    }


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
        }
      }
    });

    if (!project) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.", "Project not found.");
    }
    const isAdmin = currentUser.role === Role.ADMIN;
    
    if (!isAdmin) {
      const userAssignment = await Project_Users.findOne({
        where: { 
          project: { id: Number(projectId) }, 
          user: { id: authUserId } 
        }
      });

      if (!userAssignment) {
        throw new APIError(
          "UNAUTHORIZED",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a member of this project or an Admin to view details."
,          "Access denied. You must be a member of this project or an Admin to view details."
        );
      }
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

    if (!project || !currentUser) {
      throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project or user not found.","Project or user not found.");
    }

    const isAdmin = currentUser.role === Role.ADMIN;
    if (!isAdmin) {
        if (currentUser.role !== Role.MANAGER) throw new APIError("Forbidden", HttpStatusCode.UNAUTHORIZED, true, "Manager role required.","Manager role required.");
        const hasAccess = await isAuthorized(Number(authUserId), projectId, currentUser.role);
        if (!hasAccess) throw new APIError("Forbidden", HttpStatusCode.UNAUTHORIZED, true, "Project membership required.");
    }
    const userAssignment = await Project_Users.findOneBy({ 
      project: { id: projectId }, 
      user: { id: authUserId } 
    });

    if (!userAssignment) {
      throw new APIError("Forbidden", HttpStatusCode.UNAUTHORIZED, true, "You must be a member of this project to delete it.","You must be a member of this project to delete it.");
    }

    const activity = Activity.create({
      action: Action.DELETED,
      user: { id: authUserId } as any,
      project: { id: projectId } as any,
      description: `Project "${project.name}" (ID: ${projectId}) was deleted by ${currentUser.role} ${currentUser.name}.`
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
  const { projectId, status } = req.body;
  const authUserId = req.authenticatedUserId;

  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) throw new UnauthenticatedError("Auth required.");

    const updatedStatus = await queryRunnerFunc(async (manager) => {
      const project = await manager.findOne(Project, { where: { id: projectId } });
      if (!project) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.", "Project not found.");

      const isAdmin = currentUser.role === Role.ADMIN;
      if (!isAdmin) {
          const membership = await manager.findOne(Project_Users, { 
            where: { project: { id: projectId }, user: { id: authUserId } } 
          });
          if (!membership) throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "Access denied.", "Access denied.");
      }
let autoPosition = 0;
      if (status === Statuses.TODO) autoPosition = 1;
      else if (status === Statuses.IN_PROGRESS) autoPosition = 2;
      else if (status === Statuses.DONE) autoPosition = 3; 
      const newStatus = manager.create(Status, {
        status,
        position: autoPosition,
        user: { id: authUserId } as any,
        project: { id: projectId } as any
      });
      const savedStatus = await manager.save(newStatus);
    
      await manager.save(manager.create(Activity, {
        action: Action.STATUS_CHANGED,
        user: { id: authUserId } as any,
        project: { id: projectId } as any,
        description: `Status changed to ${status} by ${currentUser.role} ${authUserId}.`
      }));

      return savedStatus;
    });

    return res.status(HttpStatusCode.OK).json(create_json_response({ status: updatedStatus }, true, "Status updated."));
  } catch (error) {
    return handleError(error, res, "change-project-status");
  } 
};
  
  


export { create_project ,assign_user_to_project,change_project_status, update_project, delete_project, update_users_projects, get_project};