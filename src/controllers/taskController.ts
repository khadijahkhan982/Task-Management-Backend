import { Request, Response } from "express";
import { Action, HttpStatusCode, Role, Statuses } from "../utils/enum";
import { create_json_response, handleError } from "../helper/helper";
import { APIError } from "../error/api-error";
import { Activity } from "../entities/Activity";
import { Task } from "../entities/Task";
import { queryRunnerFunc } from "../utils/queryRunner";
import { Task_Assignments } from "../entities/Task_Assignments";
import { User } from "../entities/User";
import { Project_Users } from "../entities/Project_Users";
import { Status } from "../entities/Status";
import { isAuthorized } from "../validation/admin-Auth";
import { UnauthenticatedError } from "../error/unauthenticated-error";

interface AuthRequest extends Request {
  authenticatedUserId?: number;
}

const create_task = async (req: AuthRequest, res: Response) => {
  const { title, description, priority, projectId } = req.body;

  const authUserId = req.authenticatedUserId;

  try {
    const savedTask = await queryRunnerFunc(async (manager) => {
      const currentUser = await manager.findOneBy(User, { id: authUserId });
      if (!currentUser) throw new UnauthenticatedError("User not found.");

      const task = manager.create(Task, {
        title,
        description,
        priority,
        project: { id: projectId },
        creator: { id: authUserId },
      });
      const newTask = await manager.save(task);
      const activity = manager.create(Activity, {
        action: Action.CREATED,
        user: { id: authUserId } as any,
        task: { id: newTask.id } as any,
        description: `Task "${newTask.title}" created by ${currentUser.name}.`,
      });
      await manager.save(activity);
    });

    return res
      .status(HttpStatusCode.CREATED)
      .json(create_json_response({ task: savedTask }, true, "Task created."));
  } catch (error) {
    return handleError(error, res, "create-task");
  }
};

const assign_task = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, userId } = req.body;
    const authUserId = req.authenticatedUserId;

    if (!taskId || !userId) {
      throw new APIError(
        "BadRequest",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Task ID and User ID are required.",
        "Task ID and User ID are required.",
      );
    }

    if (!authUserId) {
      throw new APIError(
        "Unauthorized",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Authentication required.",
        "Authentication required.",
      );
    }
    const savedAssignment = await queryRunnerFunc(async (manager) => {
      const targetUser = await manager.findOneBy(User, { id: userId });
      if (!targetUser)
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "User being assigned does not exist.",
        );
      const currentUser = await manager.findOneBy(User, { id: authUserId });
      if (!currentUser)
        throw new UnauthenticatedError("Authentication required.");

      const isAdmin = currentUser.role === Role.ADMIN;
      const isManager = currentUser.role === Role.MANAGER;

      if (!isAdmin && !isManager) {
        throw new APIError(
          "UNAUTHORIZED",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Only admins or managers can assign users.",
          "Only admins or managers can assign users.",
        );
      }

      if (!isAdmin) {
        const hasAccess = await isAuthorized(
          Number(authUserId),
          taskId,
          currentUser.role,
        );
        if (!hasAccess)
          throw new APIError(
            "UNAUTHORIZED",
            HttpStatusCode.UNAUTHORIZED,
            true,
            "You must be a project member.",
            "You must be a project member.",
          );
      }
      const task = await manager.findOne(Task, {
        where: { id: taskId },
        relations: ["project"],
      });

      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Task or associated project not found.",
          "Task or associated project not found.",
        );
      }

      const assignment = manager.create(Task_Assignments, {
        task: { id: taskId } as any,
        user: { id: userId } as any,
        assignedBy: { id: authUserId } as any,
      });
      const newAssignment = await manager.save(assignment);

      const activity = manager.create(Activity, {
        action: Action.ASSIGNED,
        user: { id: authUserId } as any,
        task: { id: taskId } as any,
        description: `Task "${task.title}" assigned to ${targetUser.name} by ${currentUser.name}.`,
      });
      await manager.save(activity);

      return newAssignment;
    });

    return res
      .status(HttpStatusCode.CREATED)
      .json(
        create_json_response(
          { assignment: savedAssignment },
          true,
          "Task assigned successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "assign-task");
  }
};

const update_task = async (req: AuthRequest, res: Response) => {
  const { taskId, title, description, priority } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required.",
    );
  }

  if (!taskId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Task ID is required.",
      "Task ID is required.",
    );
  }
  try {
    const updatedTask = await queryRunnerFunc(async (manager) => {
      const currentUser = await manager.findOneBy(User, { id: authUserId });
      if (!currentUser)
        throw new UnauthenticatedError("Authentication required.");

      const isAdmin = currentUser.role === Role.ADMIN;
      const isManager = currentUser.role === Role.MANAGER;

      if (!isAdmin && !isManager) {
        throw new APIError(
          "UNAUTHORIZED",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Only admins or managers can assign users.",
          "Only admins or managers can assign users.",
        );
      }

      if (!isAdmin) {
        const hasAccess = await isAuthorized(
          Number(authUserId),
          taskId,
          currentUser.role,
        );
        if (!hasAccess)
          throw new APIError(
            "UNAUTHORIZED",
            HttpStatusCode.UNAUTHORIZED,
            true,
            "You must be a project member.",
            "You must be a project member.",
          );
      }
      const task = await manager.findOne(Task, {
        where: { id: taskId },
        relations: ["project"],
      });

      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Task or associated project not found.",
          "Task or associated project not found.",
        );
      }

      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;

      const savedTask = await manager.save(task);

      const activity = manager.create(Activity, {
        action: Action.UPDATED,
        user: { id: authUserId } as any,
        task: { id: taskId } as any,
        description: `Task "${task.title}" updated by ${currentUser.role} ${currentUser.name}.`,
      });
      await manager.save(activity);

      return savedTask;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { task: updatedTask },
          true,
          "Task updated successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "update-task");
  }
};

const get_task = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required.",
    );
  }

  if (!taskId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Task ID is required.",
      "Task ID is required.",
    );
  }
  try {
    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) {
      throw new UnauthenticatedError("User not found.");
    }
    const task = await Task.findOne({
      where: { id: Number(taskId) },
      relations: [
        "project",
        "comments",
        "statuses",
        "activities",
        "taskAssignments",
      ],
    });

    if (!task || !task.project) {
      throw new APIError(
        "NotFound",
        HttpStatusCode.NOT_FOUND,
        true,
        "Task or associated project not found.",
        "Task or associated project not found.",
      );
    }
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isAdmin) {
      const isMember = await Project_Users.findOneBy({
        project: { id: task.project.id },
        user: { id: authUserId },
      });

      if (!isMember) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member to view this task.",
        );
      }
    }

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response({ task }, true, "Task retrieved successfully."),
      );
  } catch (error: any) {
    return handleError(error, res, "get-task");
  }
};

const delete_task = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required.",
    );
  }

  if (!taskId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Task ID is required.",
      "Task ID is required.",
    );
  }
  try {
    await queryRunnerFunc(async (manager) => {
      const currentUser = await User.findOneBy({ id: authUserId });
      if (!currentUser) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "User not found.",
          "User not found.",
        );
      }
      const task = await manager.findOne(Task, {
        where: { id: taskId },
        relations: ["project"],
      });

      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Task or associated project not found.",
          "Task or associated project not found.",
        );
      }

      const isAdmin = currentUser.role === Role.ADMIN;

      if (!isAdmin) {
        const isMember = await Project_Users.findOneBy({
          project: { id: task.project.id },
          user: { id: authUserId },
        });

        if (!isMember) {
          throw new APIError(
            "Unauthorized",
            HttpStatusCode.UNAUTHORIZED,
            true,
            "Access denied. You must be a project member to view this task.",
            "Access denied. You must be a project member to view this task.",
          );
        }
      }

      await manager.remove(task);

      const activity = manager.create(Activity, {
        action: Action.DELETED,
        user: { id: authUserId } as any,
        description: `Task "${task.title}" deleted by user ${currentUser.name}.`,
      });
      await manager.save(activity);
    });

    return res
      .status(HttpStatusCode.OK)
      .json(create_json_response({}, true, "Task deleted successfully."));
  } catch (error: any) {
    return handleError(error, res, "delete-task");
  }
};

const change_task_status = async (req: AuthRequest, res: Response) => {
  const { taskId, status } = req.body;
  const authUserId = req.authenticatedUserId;

  if (!authUserId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required.",
    );
  }

  if (!taskId || !status) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Task ID and status are required.",
      "Task ID and status are required.",
    );
  }
  if (
    status !== Statuses.TODO &&
    status !== Statuses.IN_PROGRESS &&
    status !== Statuses.DONE
  ) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Invalid status value. Only allowed values are 'todo', 'in_progress', 'done'.",
      "Invalid status value. Only allowed values are 'todo', 'in_progress', 'done'.",
    );
  }
  try {
    const updatedStatus = await queryRunnerFunc(async (manager) => {
      const currentUser = await User.findOneBy({ id: authUserId });
      if (!currentUser) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "User not found.",
        );
      }
      const task = await manager.findOne(Task, {
        where: { id: taskId },
        relations: ["project"],
      });

      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Task or associated project not found.",
          "Task or associated project not found.",
        );
      }
      const isAdmin = currentUser.role === Role.ADMIN;

      if (!isAdmin) {
        const isMember = await Project_Users.findOneBy({
          project: { id: task.project.id },
          user: { id: authUserId },
        });

        if (!isMember) {
          throw new APIError(
            "Unauthorized",
            HttpStatusCode.UNAUTHORIZED,
            true,
            "Access denied. You must be a project member to view this task.",
          );
        }
      }
      const hasAccess = await isAuthorized(
        Number(authUserId),
        task.project.id,
        currentUser.role,
      );
      if (!hasAccess) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied.",
        );
      }
      let autoPosition = 0;
      if (status === Statuses.TODO) autoPosition = 1;
      else if (status === Statuses.IN_PROGRESS) autoPosition = 2;
      else if (status === Statuses.DONE) autoPosition = 3;
      const newStatus = manager.create(Status, {
        status,
        position: autoPosition,
        user: { id: authUserId } as any,

        task: { id: taskId } as any,
      });

      const savedStatus = await manager.save(newStatus);

      const activity = manager.create(Activity, {
        action: Action.STATUS_CHANGED,
        user: { id: authUserId } as any,
        task: { id: taskId } as any,
        description: `Task "${task.title}" status changed to "${status}" by user ${currentUser.name}.`,
      });
      await manager.save(activity);

      return savedStatus;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { status: updatedStatus },
          true,
          "Task status changed successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "change-task-status");
  }
};

const get_task_activity_log = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const authUserId = req.authenticatedUserId;

  try {
    const task = await Task.findOne({
      where: { id: Number(taskId) },
      relations: ["project", "activities", "activities.user"],
    });

    if (!task) {
      throw new APIError(
        "NotFound",
        HttpStatusCode.NOT_FOUND,
        true,
        "Task not found.",
      );
    }

    const currentUser = await User.findOneBy({ id: authUserId });
    if (!currentUser) throw new UnauthenticatedError("User not found.");

    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isAdmin) {
      const isMember = await Project_Users.findOneBy({
        project: { id: task.project.id },
        user: { id: authUserId },
      });

      if (!isMember) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member to view task logs.",
        );
      }
    }
    const hasAccess = await isAuthorized(
      Number(authUserId),
      task.project.id,
      currentUser.role,
    );
    if (!hasAccess) {
      throw new APIError(
        "Unauthorized",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Access denied.",
      );
    }

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { activities: task.activities },
          true,
          "Task activity logs retrieved successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "get-task-activity-log");
  }
};

export {
  create_task,
  assign_task,
  update_task,
  get_task,
  delete_task,
  change_task_status,
  get_task_activity_log,
};
