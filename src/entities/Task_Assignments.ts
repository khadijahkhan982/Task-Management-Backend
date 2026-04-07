import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Index, ManyToMany, JoinTable, ManyToOne, Unique} from "typeorm"
import { Task } from "./Task";
import { User } from "./User";



@Entity('task_assignments')
@Unique(['task', 'user']) // Ensure a user can only be assigned to a task once
export class Task_Assignments extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;



@ManyToOne(() => Task, (task) => task.taskAssignments, { onDelete: 'CASCADE' })
public task: Task;

@ManyToOne(() => User, (user) => user.taskAssignments)
public user: User;

     @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


@ManyToOne(() => User, (user) => user.assignedTasks)
    public assignedBy: User;






}