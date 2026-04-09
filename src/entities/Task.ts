import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, ManyToOne, OneToMany} from "typeorm"
import { User } from "./User";
import { Project } from "./Project";
import { Priority } from "../utils/enum";
import { Comment } from "./Comment";
import { Task_Assignments } from "./Task_Assignments";
import { Activity } from "./Activity";
import { Status } from "./Status";


@Entity('task')
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number


    @Column()
    title: string;

    @Column({nullable: true
    })
    description: string;

      @Column()
    priority: Priority;


   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @OneToMany(() => Comment, (comment) => comment.task)
    comments: Comment[];


@OneToMany(()=> Activity, (activity) => activity.task)
activities: Activity[];

    @OneToMany(() => Task_Assignments, (taskAssignment) => taskAssignment.task)
public taskAssignments: Task_Assignments[];


@OneToMany(()=> Status, (status) => status.task)
statuses: Status[];

}