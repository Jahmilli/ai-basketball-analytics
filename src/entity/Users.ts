import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  email!: string;

  @Column("text")
  first_name!: string;

  @Column("text")
  last_name!: string;

  @Column("date")
  date_of_birth!: Date;

  @Column("date")
  last_updated!: Date;

  @Column("date")
  created_timestamp!: Date;
}
