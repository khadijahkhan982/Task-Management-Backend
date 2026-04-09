import 'reflect-metadata';
import express from 'express';
import userRouter from './routes/user';
import projectRouter from './routes/project';
import taskRouter from './routes/task';
import commentRouter from './routes/comment';
import attachmentRouter from './routes/attachment';

const app = express();

app.use(express.json());

app.use('/api', userRouter);
app.use('/api', projectRouter);
app.use('/api', taskRouter);
app.use('/api', commentRouter);
app.use('/api', attachmentRouter);

export default app;