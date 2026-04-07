import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Index, ManyToMany, JoinTable} from "typeorm"
import { Task } from "./Task";
import { Project_Users } from "./Project_Users";
import { Statuses } from "../utils/enum";
import { Activity } from "./Activity";
import { Attachment } from "./Attachment";
import { Status } from "./Status";
import { User } from "./User";




@Entity('project')
export class Project extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number  


    @Column()
    name: string;

    @Column()
    due_date: Date;

 @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


@OneToMany(() => Task, (task) => task.project)
tasks: Task[];

@OneToMany(() => Activity, (activity) => activity.project)
activities: Activity[];

@OneToMany(() => Project_Users, (projectUser) => projectUser.project)
public projectUsers: Project_Users[];

@OneToMany(()=> Attachment, (attachment) => attachment.project)
attachments: Attachment[];

@OneToMany(()=> Status, (status) => status.project)
    status: Status[];



}