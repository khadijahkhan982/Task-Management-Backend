export const userSchemas={
    Signup:{
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email:    { type: 'string' },
            password: { type: 'string' },
            name:     { type: 'string' },
            role:    { type: 'string', enum: ['employee', 'manager','admin'] },
          },},
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
        }
        }


    