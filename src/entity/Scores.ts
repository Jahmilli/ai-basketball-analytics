import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("Scores")
export class Scores {
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
}
