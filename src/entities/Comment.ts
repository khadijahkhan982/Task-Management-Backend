import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, ManyToOne, OneToMany} from "typeorm"
import { Task } from "./Task";
import { User } from "./User";
import { Activity } from "./Activity";




@Entity('comment')
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number


    @Column()
    comment: string;


    @ManyToOne(() => Task, (task) => task.id)
    @JoinColumn({ name: 'task_id' })
    task: Task;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
     created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


@OneToMany(() => Activity, (activity) => activity.comment)
activities: Activity[];



}