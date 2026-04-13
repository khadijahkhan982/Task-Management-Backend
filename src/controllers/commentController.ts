import { Request, Response } from "express";
import { Action, HttpStatusCode } from "../utils/enum";
import { create_json_response, handleError } from "../helper/helper";
import { APIError } from "../error/api-error";
import { Activity } from "../entities/Activity";
import { Task } from "../entities/Task";
import { queryRunnerFunc } from "../utils/queryRunner";
import { User } from "../entities/User";
import { Comment } from "../entities/Comment";
import { isAuthorized } from "../validation/admin-Auth";

interface AuthRequest extends Request {
  authenticatedUserId?: number;
}

const create_comment = async (req: AuthRequest, res: Response) => {
  try {
    const { comment, taskId } = req.body;
    const userId = req.authenticatedUserId;

    if (!comment || !taskId) {
      throw new APIError(
        "BadRequest",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Comment text and Task ID are required.",
        "Comment text and Task ID are required.",
      );
    }

    if (!userId) {
      throw new APIError(
        "Unauthorized",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Authentication required.",
        "Authentication required",
      );
    }
    const currentUser = await User.findOneBy({ id: userId });
    if (!currentUser) {
      throw new APIError(
        "Unauthorized",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "User not found.",
      );
    }
    const savedComment = await queryRunnerFunc(async (manager) => {
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
          "Task with the provided ID does not exist or is not linked to any project.",
        );
      }

      const hasAccess = await isAuthorized(
        userId,
        task.project.id,
        currentUser.role,
      );

      if (!hasAccess) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member or Admin to comment.",
        );
      }

      const newComment = manager.create(Comment, {
        comment: comment,
        task: { id: taskId } as any,
        user: { id: userId } as any,
      });
      const saved = await manager.save(newComment);

      const activity = manager.create(Activity, {
        action: Action.CREATED,
        user: { id: userId } as any,
        comment: { id: saved.id } as any,
        task: { id: taskId } as any,
        description: `User ${currentUser.name} commented on task "${task.title}".`,
      });
      await manager.save(activity);

      return saved;
    });

    return res
      .status(HttpStatusCode.CREATED)
      .json(
        create_json_response(
          { comment: savedComment },
          true,
          "Comment created successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "create-comment");
  }
};

const update_comment = async (req: AuthRequest, res: Response) => {
  const { commentId, comment } = req.body;
  const userId = req.authenticatedUserId;

  if (!commentId || !comment) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Comment ID and new comment text are required.",
      "Comment ID and new comment text are required.",
    );
  }

  if (!userId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required",
    );
  }

  try {
    const updatedComment = await queryRunnerFunc(async (manager) => {
      const newComment = await manager.findOne(Comment, {
        where: { id: commentId },
        relations: ["user", "task"],
      });
      if (!newComment) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Comment not found.",
          "Comment with the provided ID does not exist.",
        );
      }

      if (newComment.user.id !== userId) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Only the comment author can update the comment.",
          "Only the author of the comment is authorized to update it.",
        );
      }

      newComment.comment = comment;
      const saved = await manager.save(newComment);

      const activity = manager.create(Activity, {
        action: Action.UPDATED,
        user: { id: userId } as any,
        comment: { id: newComment.id } as any,
        task: { id: newComment.task.id } as any,
        description: `User ${newComment.user.name} updated a comment on task "${newComment.task.title}".`,
      });
      await manager.save(activity);

      return saved;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { comment: updatedComment },
          true,
          "Comment updated successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "update-comment");
  }
};

const get_comment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.query;
  const parseCommentId = Number(commentId);
  const userId = req.authenticatedUserId;

  if (!parseCommentId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Comment ID is required.",
      "Comment ID is required.",
    );
  }

  if (!userId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required",
    );
  }

  try {
    const comment = await queryRunnerFunc(async (manager) => {
      const currentUser = await User.findOneBy({ id: userId });
      if (!currentUser) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "User not found.",
        );
      }
      const foundComment = await manager.findOne(Comment, {
        where: { id: parseCommentId },
        relations: ["user", "task"],
      });
      if (!foundComment) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Comment not found.",
          "Comment with the provided ID does not exist.",
        );
      }

      const task = await manager.findOne(Task, {
        where: { id: foundComment.task.id },
        relations: ["project"],
      });
      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Associated task or project not found.",
          "The task associated with the comment does not exist or is not linked to any project.",
        );
      }

      const hasAccess = await isAuthorized(
        userId,
        task.project.id,
        currentUser.role,
      );

      if (!hasAccess) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member or Admin to comment.",
        );
      }
      return foundComment;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { comment },
          true,
          "Comment retrieved successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "get-comment");
  }
};

const get_all_comments = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.query;
  const parseTaskId = Number(taskId);
  const userId = req.authenticatedUserId;

  if (!taskId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Task ID is required.",
      "Task ID is required.",
    );
  }

  if (!userId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required",
    );
  }

  try {
    const comments = await queryRunnerFunc(async (manager) => {
      const currentUser = await User.findOneBy({ id: userId });
      if (!currentUser) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "User not found.",
        );
      }
      const task = await manager.findOne(Task, {
        where: { id: parseTaskId },
        relations: ["project"],
      });
      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Task or associated project not found.",
          "Task with the provided ID does not exist or is not linked to any project.",
        );
      }

      const hasAccess = await isAuthorized(
        userId,
        task.project.id,
        currentUser.role,
      );

      if (!hasAccess) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member or Admin to comment.",
        );
      }
      const foundComments = await manager.find(Comment, {
        where: { task: { id: parseTaskId } },
        relations: ["user"],
      });
      return foundComments;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { comments },
          true,
          "Comments retrieved successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "get-comments");
  }
};

const delete_comment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.body;
  const userId = req.authenticatedUserId;

  if (!commentId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Comment ID is required.",
      "Comment ID is required.",
    );
  }

  if (!userId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required",
    );
  }

  try {
    await queryRunnerFunc(async (manager) => {
      const comment = await manager.findOne(Comment, {
        where: { id: commentId },
        relations: ["user", "task"],
      });
      if (!comment) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Comment not found.",
          "Comment with the provided ID does not exist.",
        );
      }

      if (comment.user.id !== userId) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Only the comment author can delete the comment.",
          "Only the author of the comment is authorized to delete it.",
        );
      }

      await manager.remove(comment);

      const activity = manager.create(Activity, {
        action: Action.DELETED,
        user: { id: userId } as any,
        task: { id: comment.task.id } as any,
        comment: { id: comment.id } as any,
        description: `User ${comment.user.name} deleted a comment on task "${comment.task.title}".`,
      });
      await manager.save(activity);
    });

    return res
      .status(HttpStatusCode.OK)
      .json(create_json_response({}, true, "Comment deleted successfully."));
  } catch (error: any) {
    return handleError(error, res, "delete-comment");
  }
};

const get_comment_activity_log = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.query;
  const parseCommentId = Number(commentId);
  const userId = req.authenticatedUserId;

  if (!parseCommentId) {
    throw new APIError(
      "BadRequest",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Comment ID is required.",
      "Comment ID is required.",
    );
  }

  if (!userId) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Authentication required.",
      "Authentication required.",
    );
  }

  try {
    const activities = await queryRunnerFunc(async (manager) => {
      const currentUser = await User.findOneBy({ id: userId });
      if (!currentUser) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "User not found.",
        );
      }
      const comment = await manager.findOne(Comment, {
        where: { id: parseCommentId },
        relations: ["task", "task.project"],
      });
      if (!comment) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Comment not found.",
          "Comment with the provided ID does not exist.",
        );
      }

      const task = comment.task;
      if (!task || !task.project) {
        throw new APIError(
          "NotFound",
          HttpStatusCode.NOT_FOUND,
          true,
          "Associated task or project not found.",
          "The task associated with the comment does not exist or is not linked to any project.",
        );
      }

      const hasAccess = await isAuthorized(
        userId,
        task.project.id,
        currentUser.role,
      );

      if (!hasAccess) {
        throw new APIError(
          "Unauthorized",
          HttpStatusCode.UNAUTHORIZED,
          true,
          "Access denied. You must be a project member or Admin to view activity logs.",
        );
      }

      const foundActivities = await manager.find(Activity, {
        where: { comment: { id: parseCommentId } },
        relations: ["user"],
        order: { created_at: "DESC" },
      });
      return foundActivities;
    });

    return res
      .status(HttpStatusCode.OK)
      .json(
        create_json_response(
          { activities },
          true,
          "Comment activity log retrieved successfully.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "get-comment-activity-log");
  }
};

export {
  create_comment,
  update_comment,
  get_comment,
  get_comment_activity_log,
  delete_comment,
  get_all_comments,
};
