import 'dotenv/config'; 
import app from './app';
import { AppDataSource } from './config/db';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

export const startServer = async () => {
    try {
        await AppDataSource.initialize();  
        logger.info("Connected to postgres database successfully.");
        console.log("Connected to postgres");  

        app.listen(PORT, () => {
            logger.info(`Server is now running on port ${PORT}`);
            console.log(`Now running on ${PORT}`);
        });

    } catch (error) {
        logger.fatal("Failed to connect to database or start server.", error); 
        console.error(error, "Not able to connect"); 
        process.exit(1); 
    }
};