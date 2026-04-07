import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User"; 
import { Project } from "./Project";

@Entity({ name: "attachments" }) 
export class Attachment {
    @PrimaryGeneratedColumn() 
    id: string;

    @Column()
    filename: string;

    @Column()
    fileType: string; 

    @Column()
    filePath: string; 

   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
     uploaded_at: Date; 
 
     @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
     updated_at: Date; 

    @ManyToOne(() => User, (user) => user.attachments)
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(()=> Project, (project) => project.attachments)
    @JoinColumn({ name: "projectId" })
    project: Project;
}
