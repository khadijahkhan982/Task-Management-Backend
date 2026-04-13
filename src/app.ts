import 'reflect-metadata';
import express from 'express';
import userRouter from './routes/user';
import projectRouter from './routes/project';
import taskRouter from './routes/task';
import commentRouter from './routes/comment';
import attachmentRouter from './routes/attachment';
import { swaggerOptions } from '../swaggerConfig';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { required } from 'zod/v4/core/util.cjs';
import { swaggerDocument } from './swagger/swaggerDoc';

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', userRouter);
app.use('/api/project', projectRouter);
app.use('/api/task', taskRouter);
app.use('/api/comment', commentRouter);
app.use('/api/attachment', attachmentRouter);

export default app;