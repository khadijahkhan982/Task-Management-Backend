import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Index, ManyToMany, ManyToOne} from "typeorm"
import { User } from "./User";
import { Task } from "./Task";
import { Project } from "./Project";
import { Comment } from "./Comment";
import { Action } from "../utils/enum";




@Entity('activity')
export class Activity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: Action;

    

@ManyToOne(()=> Project, (project) => project.id, { onDelete: 'SET NULL' ,nullable: true})
@JoinColumn({ name: "projectId" })
project: Project | null;

@ManyToOne(()=> Comment, (comment) => comment.id,{ onDelete: 'SET NULL' ,nullable: true})
@JoinColumn({ name: "commentId" })
comment: Comment;


    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(()=> Task, (task) => task.id, { onDelete: 'SET NULL' ,nullable: true})
    @JoinColumn({ name: "taskId" })
    task: Task| null;

    @Column({nullable: true})
    description: string;

     @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date; 
}