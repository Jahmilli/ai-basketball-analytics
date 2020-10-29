/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */

import { loadSync } from "protobufjs";
import * as path from "path";
import { IOut } from "../../src/interfaces/IOut";

export const waitAsync = (timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

export const decode = (type: string, buf: Buffer): { [key: string]: any } => {
  const root = loadSync(
    path.join(__dirname, "..", "..", "proto", "sample.proto")
  );
  const SampleType = root.lookupType(type);
  const decoded: any = SampleType.decode(buf);
  return SampleType.toObject(decoded, {
    enums: Number,
    longs: Number,
  });
};

export function getIn(): Buffer {
  const data = {
    name: "Proton",
    timestamp: 1540332453982,
  };
  const root = loadSync(
    path.join(__dirname, "..", "..", "proto", "sample.proto")
  );
  const In = root.lookupType("In");
  const errMsg = In.verify(data);
  if (errMsg) throw Error(errMsg);
  const message = In.fromObject(data);
  return Buffer.from(In.encode(message).finish());
}

export function getOutMessage(): IOut {
  return {
    fullName: "Prof. Proton",
    timestamp: 1540332453982,
  };
}
