import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Index, ManyToMany, ManyToOne} from "typeorm"

import { Statuses } from "../utils/enum";
import { Project } from "./Project";
import { User } from "./User";
import { Task } from "./Task";


@Entity('status')
export class Status extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: Statuses;

    @Column()
    position: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


 @ManyToOne(()=> Project, (project) => project.status)
    @JoinColumn({ name: "projectId" })
    project: Project;

     @ManyToOne(() => User, (user) => user.status)
       @JoinColumn({ name: "userId" })
       user: User; 


       @ManyToOne(() => Task, (task) => task.statuses)
       @JoinColumn({ name: "taskId" })
       task: Task;

    }