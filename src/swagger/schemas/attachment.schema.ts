
export const attachmentSchemas = {
  CreateAttachmentRequest: {
    type: 'object',
    required: ['file', 'projectId'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'The file to upload'
      },
      projectId: {
        type: 'number',
        description: 'ID of the project to attach the file to'
      }
    }
  },
  UpdateAttachmentRequest: {
    type: 'object',
    required: ['file', 'projectId', 'attachmentId'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'The new file to replace the existing one'
      },
      projectId: {
        type: 'number',
        description: 'ID of the project'
      },
      attachmentId: {
        type: 'string',
        description: 'ID of the attachment to update'
      }
    }
  },
  DeleteAttachmentRequest: {
    type: 'object',
    required: ['attachmentId'],
    properties: {
      attachmentId: {
        type: 'number',
        description: 'ID of the attachment to delete'
      }
    }
  }
};