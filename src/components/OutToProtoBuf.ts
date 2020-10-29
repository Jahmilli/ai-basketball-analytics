import { loadSync } from "protobufjs";
import { getLogger } from "../utils/Logging";
import * as Metrics from "../utils/Metrics";
import * as util from "util";
import { IOut } from "../interfaces/IOut";
import * as path from "path";

// This class is responsible for serialising an object of type IOut to use when producing to Kafka
// Note that the format of IOut should resemble that in "proto/sample.proto" (although with camelCasing instead of snake_casing)
export class OutToProtoBuf {
  readonly logger = getLogger();
  private root = loadSync(
    path.join(__dirname, "..", "..", "proto", "sample.proto")
  );

  convert(data: IOut): Uint8Array {
    this.logger.debug(`Transforming Out to protobuf: ${util.inspect(data)}`);
    const Out = this.root.lookupType("Out");
    const errMsg = Out.verify(data);
    if (!!errMsg) {
      Metrics.toProtoBufErrorTotal.inc();
      throw new Error(
        `Failed to convert Out to ProtoBuf: ${util.inspect(errMsg)}`
      );
    }
    const message = Out.fromObject(data);
    return Out.encode(message).finish();
  }
}
