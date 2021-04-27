import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("results")
export class results {
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
