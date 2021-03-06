import { getLogger } from "../utils/Logging";
import { inspect } from "util";
import { analyseKeypoints } from "../algorithms/algorithms";
import Database from "../components/Database";
import { IConvertBody } from "../interfaces/IApiV1";
import { calculateScore } from "../algorithms/scores";

export class AnalyticsService {
  private logger = getLogger();

  constructor(readonly database: Database) {}

  async convert(inObj: IConvertBody): Promise<any> {
    console.log("inObj is ", inObj);
    this.analyseKeypoints(inObj);
    const convertedName = {
      fullName: `Prof. Seb`,
      timestamp: Date.now(),
    };
    this.logger.debug(`Converted name is ${inspect(convertedName)}`);
    return convertedName;
  }

  async analyseKeypoints(inObj: IConvertBody) {
    const result = analyseKeypoints(inObj.keypoints);
    const video = await this.database.updateVideoResult(inObj.id, result.feedback);
    console.log(video);
    const playerScores = calculateScore(result.scores, video.user_id);
    console.log("player scores are ", playerScores);
    await this.database.writePlayerScores(playerScores);
  }
}
