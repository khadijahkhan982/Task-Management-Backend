export const projectSchemas = {
  CreateProjectRequest: {
    type: 'object',
    required: ['name', 'due_date'],
    properties: {
      name:     { type: 'string', example: 'My Project' },
      due_date: { type: 'string', format: 'date-time', example: '2024-12-31T23:59:59Z' },
    },
  },
  UpdateProjectRequest: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'number', example: 1 },
      name:      { type: 'string', example: 'Updated Project' },
      due_date:  { type: 'string', format: 'date-time' },
    },
  },
  AssignUserRequest: {
    type: 'object',
    required: ['projectId', 'userId'],
    properties: {
      projectId: { type: 'number', example: 1 },
      userId:    { type: 'number', example: 5 },
    },
  },
  ProjectStatusRequest: {
    type: 'object',
    required: ['projectId', 'status'],
    properties: {
      projectId: { type: 'number', example: 1 },
      status:    { type: 'string', enum: ['todo', 'in_progress', 'done'] },
    },
  },
};