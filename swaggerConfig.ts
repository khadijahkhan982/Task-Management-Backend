import { Options } from 'swagger-jsdoc';



export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            title:       { type: 'string' },
            description: { type: 'string' },
            priority:    { type: 'string' },
            projectId:   { type: 'number' },
          },
        },
        Signup: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email:    { type: 'string' },
            password: { type: 'string' },
            name:     { type: 'string' },
          },
        },
        VerifyOtp: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string' },
            otp:   { type: 'string' },
          },
        },
        UpdateUser: {
          type: 'object',
          properties: {
            name:     { type: 'string' },
            email:    { type: 'string' },
            password: { type: 'string' },
          },
        },
        ResetPassword: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string' },
            password: { type: 'string' },
          },
        },
        Project: {
          type: 'object',
          required: ['name', 'due_date'],
          properties: {
            projectId: { type: 'number' },
            name:      { type: 'string' },
            due_date:  { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          required: ['taskId', 'comment'],
          properties: {
            commentId: { type: 'number' },
            taskId:    { type: 'number' },
            comment:   { type: 'string' },
          },
        },
        Attachment:{
          type: 'object',
          required: ['taskId', 'file'],
          properties: {
            taskId:       { type: 'number' },
            file:         { type: 'string', format: 'binary' },
          },
        }
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/entities/*.ts'],  
};