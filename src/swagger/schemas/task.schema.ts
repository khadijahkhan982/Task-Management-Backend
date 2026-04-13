export const taskSchemas = {
    CreateTaskRequest:{
        type:'object',
        required:['title','description','priority','projectId'],
        properties:{
            title:{ type:'string' },
            description:{ type:'string' },
            priority:{ type:'string', enum: ['low', 'medium', 'high'] },
            projectId:{ type:'number' }
        }
    },
    UpdateTaskRequest:{
        type:'object',
        properties:{
            title:{ type:'string' },
            description:{ type:'string' },
            priority:{ type:'string', enum: ['low', 'medium', 'high'] },
            projectId:{ type:'number' }
        }
    },
    AssignTaskRequest: {
    type: 'object',
    required: ['taskId', 'userId'],
    properties: {
      taskId: { type: 'number', example: 9 },
      userId: { type: 'number', example: 3 },
    },
  },
  TaskStatusRequest: {
    type: 'object',
    required: ['taskId', 'status'],
    properties: {
      taskId: { type: 'number', example: 9 },
      status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
    },
  },

}