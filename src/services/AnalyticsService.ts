import { getLogger } from "../utils/Logging";
import { inspect } from "util";

export class AnalyticsService {
  private logger = getLogger();

  constructor() {}

  async convert(inObj: any): Promise<any> {
    console.log("inObj is ", inObj);
    const convertedName = {
      fullName: `Prof. ${inObj.name}`,
      timestamp: inObj.timestamp,
    };
    this.logger.debug(`Converted name is ${inspect(convertedName)}`);
    return convertedName;
  }
}
