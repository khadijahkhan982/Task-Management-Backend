
export const commentPaths = {
  '/api/comment': {
    post: {
      summary: 'Create a new comment',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateCommentRequest'
            }
          }
        }
      },
      responses: {
        201: { description: 'Comment created' },
        401: { description: 'Unauthorized' }
      }
    },
    get: {
      summary: 'Get a comment by ID',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'commentId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the comment to retrieve'
        }
      ],
      responses: {
        200: { description: 'Comment retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Comment not found' }
      }
    },
    put: {
      summary: 'Update a comment',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
             $ref: '#/components/schemas/UpdateCommentRequest'
            }
          }
        }
      },
      responses: {
        200: { description: 'Comment updated successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Comment not found' }
      }
    },
    delete: {
      summary: 'Delete a comment',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
             $ref: '#/components/schemas/DeleteCommentRequest'
            }
          }
        }
      },
      responses: {
        200: { description: 'Comment deleted successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Comment not found' }
      }
    }
  },
  '/api/comment/all': {
    get: {
      summary: 'Get all comments for a task',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'taskId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the task to retrieve comments for'
        }
      ],
      responses: {
        200: { description: 'Comments retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Task not found' }
      }
    }
  },
  '/api/comment/activity-log': {
    get: {
      summary: 'Get activity log for a comment',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'commentId',
          required: true,
          schema: { type: 'number' },
          description: 'ID of the comment to retrieve activity logs for'
        }
      ],
      responses: {
        200: { description: 'Activity log retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Comment not found' }
      }
    }
  }
};