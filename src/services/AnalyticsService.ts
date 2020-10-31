import { getLogger } from "../utils/Logging";
import { inspect } from "util";
import { callStuff } from "../algorithms/algorithms";
import Database from "../components/Database";
import { IConvertBody } from "../interfaces/IApiV1";

export class AnalyticsService {
  private logger = getLogger();

  constructor(readonly database: Database) {}

  async convert(inObj: IConvertBody): Promise<any> {
    console.log("inObj is ", inObj);
    this.analyseKeypoints(inObj.keypoints);
    const convertedName = {
      fullName: `Prof. Seb`,
      timestamp: Date.now(),
    };
    this.logger.debug(`Converted name is ${inspect(convertedName)}`);
    return convertedName;
  }

  async analyseKeypoints(inObj: IConvertBody) {
    const feedback = callStuff(inObj.keypoints) as any;
    await this.database.updateVideoResult(inObj.id, feedback);
  }
}
