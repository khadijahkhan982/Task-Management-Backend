export const projectPaths = {
  '/api/project': {
    post: {
      summary: 'Create a new project',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectRequest' },
          },
        },
      },
      responses: {
        201: { description: 'Project created successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
    get: {
      summary: 'Get a project by ID',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'projectId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the project to retrieve',
        },
      ],
      responses: {
        200: { description: 'Project retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' },
      },
    },
    put: {
      summary: 'Update a project',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProjectRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Project updated successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' },
      },
    },
    delete: {
      summary: 'Delete a project',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['projectId'],
              properties: {
                projectId: { type: 'number', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Project deleted successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' },
      },
    },
  },

  '/api/project/users': {
    post: {
      summary: 'Assign a user to a project',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignUserRequest' },
          },
        },
      },
      responses: {
        201: { description: 'User assigned successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project or user not found' },
      },
    },
  },

  '/api/project/status': {
    post: {
      summary: 'Change project status',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectStatusRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Status updated successfully' },
        400: { description: 'Invalid status value' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' },
      },
    },
  },

  '/api/project/activity-log': {
    get: {
      summary: 'Get project activity logs',
      tags: ['Projects'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'projectId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the project',
        },
      ],
      responses: {
        200: { description: 'Activity logs retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' },
      },
    },
  },
};