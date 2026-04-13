
export const userPaths = {
  '/api/signup': {
    post: {
      summary: 'Register a new user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Signup' }
          }
        }
      },
      responses: {
        201: { description: 'User registered, OTP sent' },
        400: { description: 'Validation error' }
      }
    }
  },
  '/api/verify-signup': {
    post: {
      summary: 'Verify signup OTP',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyOtp' }
          }
        }
      },
      responses: {
        200: { description: 'Signup verified' },
        400: { description: 'Invalid or expired OTP' }
      }
    }
  },
  '/api/login': {
    post: {
      summary: 'Log in a user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Login successful, returns JWT' },
        401: { description: 'Invalid credentials' }
      }
    }
  },
  '/api/logout': {
    post: {
      summary: 'Log out the current user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Logged out successfully' },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/user-data': {
    get: {
      summary: 'Get current user data',
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User data retrieved' },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/update-user': {
    put: {
      summary: 'Update current user profile',
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUser' }
          }
        }
      },
      responses: {
        200: { description: 'User updated successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/forgot-password': {
    post: {
      summary: 'Request a password reset OTP',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'OTP sent to email' },
        404: { description: 'User not found' }
      }
    }
  },
  '/api/verify-otp': {
    post: {
      summary: 'Verify password reset OTP',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyOtp' }
          }
        }
      },
      responses: {
        200: { description: 'OTP verified' },
        400: { description: 'Invalid or expired OTP' }
      }
    }
  },
  '/api/reset-password': {
    post: {
      summary: 'Reset user password',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPassword' }
          }
        }
      },
      responses: {
        200: { description: 'Password reset successful' },
        400: { description: 'Validation error' }
      }
    }
  },
  '/api/delete-user': {
    delete: {
      summary: 'Delete current user account',
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User deleted successfully' },
        401: { description: 'Unauthorized' }
      }
    }
  }
};