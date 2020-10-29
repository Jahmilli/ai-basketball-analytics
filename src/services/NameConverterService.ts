import { KafkaProducer } from "../components/KafkaProducer";
import { getLogger } from "../utils/Logging";
import { OutToProtoBuf } from "../components/OutToProtoBuf";
import { inspect } from "util";
import { IIn } from "../interfaces/IIn";
import { IOut } from "../interfaces/IOut";

export class NameConverterService {
  private logger = getLogger();
  private outToProtoBuf = new OutToProtoBuf();

  constructor(readonly kafkaProducer: KafkaProducer) {}

  async convert(inObj: IIn): Promise<IOut> {
    const convertedName = {
      fullName: `Prof. ${inObj.name}`,
      timestamp: inObj.timestamp,
    };
    this.logger.debug(`Converted name is ${inspect(convertedName)}`);
    const proto = this.outToProtoBuf.convert(convertedName);
    await this.kafkaProducer.send(proto);
    return convertedName;
  }
}
