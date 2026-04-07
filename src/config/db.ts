import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { Project } from '../entities/Project';

import 'dotenv/config'
import { Comment } from '../entities/Comments';
import { Task_Assignments } from '../entities/Task_Assignments';
import { Project_Users } from '../entities/Project_Users';
import { Activity } from '../entities/Activity';
import { Attachment } from '../entities/Attachment';
import { UserSessions } from '../entities/UserSessions';
import { Status } from '../entities/Status';


dotenv.config();


export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Task, Project, Activity, Comment, Task_Assignments,
         Project_Users, Attachment, UserSessions, Status
        
    ],
    synchronize: true, 
    logging: process.env.NODE_ENV === 'development',
});