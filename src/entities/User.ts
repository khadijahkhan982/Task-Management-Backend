import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Index, ManyToMany} from "typeorm"

import { Role } from "../utils/enum";
import { Task_Assignments } from "./Task_Assignments";
import { Project_Users } from "./Project_Users";
import { Activity } from "./Activity";
import { Comment } from "./Comments";
import { Attachment } from "./Attachment";
import { Status } from "./Status";


@Entity('user')
export class User extends BaseEntity {


    @PrimaryGeneratedColumn()
    id: number;


   @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;


    @Column()
    role: Role;

   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date; 
@Column({ default: false })
is_verified: boolean;

    @OneToMany(() => Task_Assignments, (taskAssignment) => taskAssignment.user)
    public taskAssignments: Task_Assignments[];


    @OneToMany(()=> Project_Users, (projectUser) => projectUser.user)
    public projectUsers: Project_Users[];

    @OneToMany(() => Task_Assignments, (taskAssignment) => taskAssignment.assignedBy)
        public assignedTasks: Task_Assignments[];


    @OneToMany(()=> Activity, (activity) => activity.user)
    activities: Activity[];

    @OneToMany(()=> Comment, (comment) => comment.user)
    comments: Comment[];


    @OneToMany(()=> Attachment, (attachment) => attachment.user)
    attachments: Attachment[];

    @OneToMany(()=> Status, (status) => status.user)
    status: Status[];

}