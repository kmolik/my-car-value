import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;

  @Column({ default: true })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log(`User with id ${this.id} has been inserted`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`User with id ${this.id} has been updated`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`User with id ${this.id} has been removed`);
  }
}
