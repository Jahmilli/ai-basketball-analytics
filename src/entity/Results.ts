import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("results")
export class Result {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  user_id!: string;

  @Column("text")
  score_prep!: string;

  @Column("text")
  score_exec!: string;

  @Column("text")
  score_follow!: string;

  @Column("date")
  created_timestamp! : Date;

  user_email!: string;
}
