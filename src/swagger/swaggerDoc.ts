import { attachmentPaths } from './paths/attachmentSwagger';
import { commentPaths } from './paths/commentSwagger';
import { projectPaths }  from './paths/projectSwagger';
import { taskPaths } from './paths/taskSwagger';
import { userPaths } from './paths/userSwagger';
import { attachmentSchemas } from './schemas/attachment.schema';
import { commentSchemas } from './schemas/comment.schema';
import { projectSchemas } from './schemas/project.schema';
import { taskSchemas } from './schemas/task.schema';
import { userSchemas } from './schemas/user.schema';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'REST API for task management system',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Development server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...projectSchemas,
      ...taskSchemas,
      ...userSchemas,
      ...commentSchemas,
      ...attachmentSchemas
   
    },
  },
  paths: {
    ...projectPaths,
    ...taskPaths,
    ...userPaths,
    ...commentPaths,
    ...attachmentPaths
 
  },
};