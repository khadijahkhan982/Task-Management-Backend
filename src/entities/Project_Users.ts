import { Entity, UpdateDateColumn,Column, CreateDateColumn,BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, Unique} from "typeorm"
import { Project } from "./Project";
import { User } from "./User";



@Entity('project_users')
@Unique(['project', 'user']) // Ensure a user can only be added to a project once
export class Project_Users extends BaseEntity {
    @PrimaryGeneratedColumn()
    public userToProjectID: number;


    @ManyToOne(() => Project, (project) => project.projectUsers, { onDelete: 'CASCADE' })
    public project: Project;

    @ManyToOne(() => User, (user) => user.projectUsers)
    public user: User;


      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date; 

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;




}