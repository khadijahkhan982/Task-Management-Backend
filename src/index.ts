import 'reflect-metadata';
import 'dotenv/config'; // Ensures env vars are available for other imports
import express from 'express';
import { AppDataSource } from './config/db';
import { logger } from './utils/logger';
import userRouter from './routes/user';
import projectRouter from './routes/project';
import taskRouter from './routes/task';
import commentRouter from './routes/comment';
import attachmentRouter from './routes/attachment'
// --- Route Imports ---


const app = express();

const main = async () => {
    try {
        // Initialize the separate DB instance
        await AppDataSource.initialize();  
        logger.info("Connected to postgres database successfully.");
        console.log("Connected to postgres");  

        app.use(express.json()); 
        app.use('/api', userRouter); 
        app.use('/api', projectRouter)
        app.use('/api', taskRouter);
        app.use('/api', commentRouter);
        app.use('/api', attachmentRouter);
        const PORT =  3001; 

        app.listen(PORT, () => {
            logger.info(`Server is now running on port ${PORT}`);
            console.log(`now running on ${PORT}`);
        });

    } catch (error) {
        logger.fatal("Failed to connect to database or start server.", error); 
        console.error(error, "not able to connect"); 
        process.exit(1); 
    }
};

main();