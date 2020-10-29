import { OutToProtoBuf } from "./OutToProtoBuf";
import { getOutMessage } from "../../test/utils/TestHelper";

const mockLookupType = jest.fn();
jest.mock("protobufjs", () => {
  return {
    loadSync: () => {
      return {
        lookupType: mockLookupType,
      };
    },
  };
});

describe("OutToProtoBuf", () => {
  beforeEach(() => jest.clearAllMocks());
  it("Should throw error if protobuf verify fails", () => {
    const otpb = new OutToProtoBuf();
    const outMessage = getOutMessage();
    mockLookupType.mockImplementationOnce(() => {
      return {
        verify: () => {
          return "Custom Error";
        },
      };
    });
    otpb.logger.warn = jest.fn();
    expect(() => otpb.convert(outMessage)).toThrowError(
      "Failed to convert Out to ProtoBuf: 'Custom Error'"
    );
  });
  it("Should translate Transformed to protobuf", () => {
    const otpb = new OutToProtoBuf();
    const outMessage = getOutMessage();
    mockLookupType.mockImplementationOnce(() => {
      return {
        verify: () => {
          return undefined;
        },
        fromObject: jest.fn(),
        encode: () => {
          return {
            finish: () => {
              return "Encoded String";
            },
          };
        },
      };
    });
    expect(otpb.convert(outMessage)).toEqual("Encoded String");
  });
});
