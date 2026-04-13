export const taskPaths = {
  '/api/task': {
    post: {
      summary: 'Create a new task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateTaskRequest' },
          },
        },
      },
      responses: {
        201: { description: 'Task created successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
    get: {
      summary: 'Get a task by ID',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'taskId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the task to retrieve',
        },
      ],
      responses: {
        200: { description: 'Task retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' },
      },
    },
    put: {
      summary: 'Update a task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Task updated successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' },
      },
    },
    delete: {
      summary: 'Delete a task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['taskId'],
              properties: {
                taskId: { type: 'number', example: 9 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Task deleted successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' },
      },
    },
  },

  '/api/task/user': {
    post: {
      summary: 'Assign a user to a task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignTaskRequest' },
          },
        },
      },
      responses: {
        201: { description: 'User assigned successfully' },
        400: { description: 'Task ID and User ID are required' },
        401: { description: 'Unauthorized - only admins or managers can assign' },
        404: { description: 'Task or user not found' },
      },
    },
  },

  '/api/task/status': {
    post: {
      summary: 'Change task status',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TaskStatusRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Task status changed successfully' },
        400: { description: 'Invalid status value or missing fields' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' },
      },
    },
  },

  '/api/task/activity-log': {
    get: {
      summary: 'Get task activity logs',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'taskId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the task to retrieve logs for',
        },
      ],
      responses: {
        200: { description: 'Activity logs retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' },
      },
    },
  },
};