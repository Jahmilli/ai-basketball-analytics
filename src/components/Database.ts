import { createConnection, getConnection } from "typeorm";
import { Video } from "../entity/Video";
import { Result } from "../entity/Results";
import { User } from "../entity/Users";
import { getLogger } from "../utils/Logging";
import * as util from "util";
import { IFeedback, IScores } from "../algorithms/algorithms";
import config from "config";
import { IDatabaseConfig } from "../interfaces/IConfig";

export default class Database {
  private logger = getLogger();
  constructor(readonly connectionName: string) {}

  async start(): Promise<void> {
    const databaseConfig: IDatabaseConfig = config.get("database");
    await createConnection({
      name: this.connectionName,
      entities: [User, Video, Result],
      ...databaseConfig,
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DATABASE,
    });
    this.logger.info(
      `Started connection with connection name ${this.connectionName}`
    );
  }

  async stop(): Promise<void> {
    await getConnection(this.connectionName).close();
    this.logger.info(
      `Stopped connection with connection name ${this.connectionName}`
    );
  }

  async writeVideoResult(video: Video): Promise<Video> {
    const result = await getConnection(this.connectionName).manager.save(video);
    this.logger.info(
      `Video entry has been saved in the database. Video is ${util.inspect(
        video
      )}`
    );
    return result;
  }

  async updateVideoResult(id: string, feedback: IFeedback): Promise<Video> {
    const connectionManager = getConnection(this.connectionName).manager;
    const video = await connectionManager.findOne(Video, id);
    if (!video) {
      // TODO: Refactor errors...
      throw new Error("Video not found in database");
    }
    video.feedback = feedback;
    video.is_processed = true;
    await connectionManager.save(video);
    this.logger.info(`Video has been updated. Video is ${util.inspect(video)}`);
    return video;
  }

  async getVideosForUser(userId: string): Promise<Video[] | undefined> {
    const connectionManager = getConnection(this.connectionName).manager;
    const result = await connectionManager.find(Video, { user_id: userId });
    return result;
  }

  async writePlayerScores(scores: Result): Promise<Result | undefined> {
    try {
      const result = await getConnection(this.connectionName).manager.save(
        scores
      );
      return result;
    } catch (err) {
      console.warn(`An error occurred when writing player scores`, err);
    }
  }

  async getAllPlayerScores(): Promise<any> {
    const connectionManager = getConnection(this.connectionName).manager;
    const allPlayerScores = await connectionManager.find(Result);
    const allUsers = await connectionManager.find(User);

    const payload = [];

    for (const user of allUsers) {
      for (const result of allPlayerScores) {
        if (result.user_id === user.id) {
          payload.push({
            ...result,
            first_name: user.first_name,
            last_name: user.last_name,
          });
        }
      }
    }

    return payload;
  }

  async getLastScore(userId: string): Promise<any> {
    const connectionManager = getConnection(this.connectionName).manager;
    const lastScore = await connectionManager
      .createQueryBuilder(Result, "results")
      .where("results.user_id = :user_id", { user_id: userId })
      .orderBy("results.created_timestamp", "DESC")
      .getOne();

    return lastScore;
  }
}
