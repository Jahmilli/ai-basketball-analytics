import { createConnection, getConnection } from "typeorm";
import { Video } from "../entity/Video";
import { Scores } from "../entity/Scores";
import { getLogger } from "../utils/Logging";
import * as util from "util";
import { IFeedback } from "../algorithms/algorithms";

export default class Database {
  private logger = getLogger();
  constructor(readonly connectionName: string) {}

  async start(): Promise<void> {
    await createConnection(this.connectionName);
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

  async writePlayerScores(id: string, scores: any): Promise<any> {
    const result = await getConnection(this.connectionName).manager.save(
      scores
    );
    return result;
  }

  async getAllPlayerScores(): Promise<any> {
    const connectionManager = getConnection(this.connectionName).manager;
    const allPlayerScores = await connectionManager.find(Scores);

    return allPlayerScores;
  }

  async getLastScore(): Promise<any> {
    const connectionManager = getConnection(this.connectionName).manager;
    const previousScores = await connectionManager.findOne(Scores);

    return previousScores;
  }
}
