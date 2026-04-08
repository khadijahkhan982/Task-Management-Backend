import fs from "fs";
import { Request, Response } from "express";
import { Action, HttpStatusCode, Role, Statuses } from "../utils/enum";
import { create_json_response, handleError } from "../utils/helper";
import { APIError } from "../utils/api-error";
import { Activity } from "../entities/Activity";
import { Project } from "../entities/Project";
import { queryRunnerFunc } from "../utils/queryRunner";
import { Attachment } from "../entities/Attachment";
import { isAuthorized } from "../utils/admin-Auth";
import { User } from "../entities/User";



interface AuthRequest extends Request {
  authenticatedUserId?: number;
}



const create_attachment = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.body;
    const authUserId = req.authenticatedUserId;
    const file = req.file; // Populated by Multer

    if (!file) {
        throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "No file uploaded.");
    }

    if (!projectId) {
        throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "Project ID is required.");
    }

    try {
        const attachment = await queryRunnerFunc(async (manager) => {
            const currentUser = await User.findOneBy({ id: authUserId });
            if (!currentUser) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User not found.");
            }

            const project = await manager.findOne(Project, { where: { id: projectId } });
            if (!project) {
                throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Project not found.");
            }
            const hasAccess = await isAuthorized(Number(authUserId), Number(projectId), currentUser.role);
            
            if (!hasAccess) {
                throw new APIError(
                    "Unauthorized", 
                    HttpStatusCode.UNAUTHORIZED, 
                    true, 
                    "Access denied. You must be a project member or Admin to upload files."
                );
            }
            const newAttachment = manager.create(Attachment, {
                filename: file.originalname,
                fileType: file.mimetype,
                filePath: file.path, 
                user: { id: authUserId } as any, 
                project: { id: projectId } as any 
            });

            const savedAttachment = await manager.save(newAttachment);
            const activity = manager.create(Activity, {
                action: Action.UPDATED,
                user: { id: authUserId } as any,
                project: { id: projectId } as any,
                description: `${currentUser.role} ${currentUser.name} uploaded file: ${file.originalname}`
            });
            await manager.save(activity);

            return savedAttachment;
        });

        return res.status(HttpStatusCode.CREATED).json(
            create_json_response({ attachment }, true, "File uploaded successfully.")
        );
    } catch (error: any) {
        return handleError(error, res, "create-attachment");
    }
};



const update_attachment = async (req: AuthRequest, res: Response) => {

   const { projectId, attachmentId } = req.body;
   const authUserId = req.authenticatedUserId;
   const file = req.file;

   if (!file) {
       throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "No file uploaded.");
   }

   if (!projectId) {
       throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "Project ID is required.");
   }



try {
    const attachment = await queryRunnerFunc(async (manager) => {
          const currentUser = await User.findOneBy({ id: authUserId });
            if (!currentUser) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User not found.");
            }

        const existingAttachment = await manager.findOne(Attachment, { 
            where: { id: attachmentId as string} 
        });
        
        if (!existingAttachment) {
       
            if (file.path) fs.unlinkSync(file.path);
            throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Attachment not found.");
        }
 const hasAccess = await isAuthorized(Number(authUserId), Number(projectId), currentUser.role);
            
            if (!hasAccess) {
                throw new APIError(
                    "Unauthorized", 
                    HttpStatusCode.UNAUTHORIZED, 
                    true, 
                    "Access denied. You must be a project member or Admin to update files."
                );
            }
        const oldFilePath = existingAttachment.filePath;
        existingAttachment.filename = file.originalname;
        existingAttachment.fileType = file.mimetype;
        existingAttachment.filePath = file.path;

        const updatedAttachment = await manager.save(existingAttachment);

        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
        const activity = manager.create(Activity, {
            action: Action.UPDATED,
            user: { id: authUserId } as any,
            project: { id: projectId } as any,
            description: `User ${authUserId} updated file ${existingAttachment.id}: ${file.originalname}`
        });
        await manager.save(activity);

        return updatedAttachment;
    });

    return res.status(HttpStatusCode.OK).json(
        create_json_response({ attachment }, true, "File updated successfully.")
    );
} catch (error: any) {
    return handleError(error, res, "update-attachment");
}

};




const get_attachment = async (req: AuthRequest, res: Response) => {
    const { attachmentId } = req.body;
    const authUserId = req.authenticatedUserId;

    if(!attachmentId) {
        throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "Attachment ID is required.");
    }
    if (!authUserId) {
        throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User authentication required.");
    }

    try {
        const fullUrl = await queryRunnerFunc(async (manager) => {
             const currentUser = await User.findOneBy({ id: authUserId });
            if (!currentUser) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User not found.");
            }
            const foundAttachment = await manager.findOne(Attachment, { 
                where: { id: attachmentId as string } 
                , relations: ["user"]
            });
             if (!foundAttachment) {
                throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Attachment not found.", "Attachment not found.");
            }
            if(foundAttachment?.user.id !== authUserId) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "You do not have permission to access this attachment.", "You do not have permission to access this attachment.");
            }
 const hasAccess = await isAuthorized(Number(authUserId), foundAttachment.project?.id, currentUser.role);
            
            if (!hasAccess) {
                throw new APIError(
                    "Unauthorized", 
                    HttpStatusCode.UNAUTHORIZED, 
                    true, 
                    "Access denied. You must be a project member or Admin to update files."
                );
            }
    

            const protocol = req.protocol; 
            const host = req.get('host');  
            
            return `${protocol}://${host}/${foundAttachment.filePath}`;
        });

        return res.status(HttpStatusCode.OK).json(
            create_json_response({ url: fullUrl }, true, "Attachment retrieved successfully.")
        );
    } catch (error: any) {
        return handleError(error, res, "get-attachment");
    }
};


const delete_attachment = async (req: AuthRequest, res: Response) => {
    const { attachmentId } = req.body;
    const authUserId = req.authenticatedUserId;

    if(!attachmentId) {
        throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "Attachment ID is required.", "Attachment ID is required.");
    }
    if (!authUserId) {
        throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User authentication required.", "User authentication required.");
    }

    try {
        await queryRunnerFunc(async (manager) => {
                const currentUser = await User.findOneBy({ id: authUserId });
            if (!currentUser) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "User not found.", "User not found.");
            }
            const existingAttachment = await manager.findOne(Attachment, { 
                where: { id: attachmentId as string } ,
                relations: ["user", "project"]
            });
            
            if (!existingAttachment) {
                throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "Attachment not found.", "Attachment not found.");
            }
            if (existingAttachment.user.id !== authUserId) {
                throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED, true, "You do not have permission to delete this attachment.", "You do not have permission to delete this attachment.");
            }

        const attachmentIdValue = existingAttachment.id; 
        const attachmentName = existingAttachment.filename;
        const filePath = existingAttachment.filePath;
        const projectId = existingAttachment.project?.id;
 const hasAccess = await isAuthorized(Number(authUserId), Number(projectId), currentUser.role);
            
            if (!hasAccess) {
                throw new APIError(
                    "Unauthorized", 
                    HttpStatusCode.UNAUTHORIZED, 
                    true, 
                    "Access denied. You must be a project member or Admin to update files."
                );
            }
        await manager.remove(existingAttachment);

            const activity = manager.create(Activity, {
                action: Action.DELETED,
                user: { id: authUserId } as any,
                project: projectId ? { id: projectId } as any : null, 
description: `User ${authUserId} deleted file ${attachmentIdValue}: ${attachmentName}`            });
            await manager.save(activity);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        return res.status(HttpStatusCode.OK).json(
            create_json_response({}, true, "Attachment deleted successfully.")
        );
    } catch (error: any) {
        return handleError(error, res, "delete-attachment");
    }
};



export {
    create_attachment, update_attachment, get_attachment, delete_attachment
}
