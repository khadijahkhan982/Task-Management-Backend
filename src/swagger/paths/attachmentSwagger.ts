
export const attachmentPaths = {
  '/api/attachment': {
    post: {
      summary: 'Upload a new attachment',
      tags: ['Attachments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateAttachmentRequest' }
          }
        }
      },
      responses: {
        201: { description: 'File uploaded successfully' },
        400: { description: 'No file uploaded or missing projectId' },
        401: { description: 'Unauthorized' },
        404: { description: 'Project not found' }
      }
    },
    put: {
      summary: 'Update an existing attachment',
      tags: ['Attachments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/UpdateAttachmentRequest' }
          }
        }
      },
      responses: {
        200: { description: 'File updated successfully' },
        400: { description: 'No file uploaded or missing fields' },
        401: { description: 'Unauthorized' },
        404: { description: 'Attachment not found' }
      }
    },
    get: {
      summary: 'Get an attachment URL by ID',
      tags: ['Attachments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'attachmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the attachment to retrieve'
        }
      ],
      responses: {
        200: { description: 'Attachment URL retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Attachment not found' }
      }
    },
    delete: {
      summary: 'Delete an attachment',
      tags: ['Attachments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeleteAttachmentRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Attachment deleted successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Attachment not found' }
      }
    }
  }
};

