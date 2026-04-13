export const commentSchemas = {
  // --- Request Schemas ---
  CreateCommentRequest: {
    type: 'object',
    required: ['comment', 'taskId'],
    properties: {
      comment: { type: 'string', example: 'This is a great task!' },
      taskId: { type: 'number', example: 101 }
    }
  },
  UpdateCommentRequest: {
    type: 'object',
    required: ['commentId'],
    properties: {
      commentId: { type: 'number', example: 5 },
      comment: { type: 'string', example: 'Updated comment text' }
    }
  },
  DeleteCommentRequest: {
    type: 'object',
    required: ['commentId'],
    properties: {
      commentId: { type: 'number', example: 5 }
    }
  },

  CommentResponse: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      comment: { type: 'string' },
      taskId: { type: 'number' },
      userId: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  ActivityLogResponse: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        action: { type: 'string', example: 'update' },
        oldValue: { type: 'string' },
        newValue: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  }
};