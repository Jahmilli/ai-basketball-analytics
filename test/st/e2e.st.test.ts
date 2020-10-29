import { Consumer, Kafka, logLevel } from "kafkajs";

const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet,
  };
});

import { Server } from "../../src/Server";
import { decode, waitAsync } from "../utils/TestHelper";
import { WinstonLogCreator } from "../../src/utils/Logging";
import { PassThrough } from "stream";
import { IKafkaConfig } from "../../src/interfaces/IConfig";
import request from "supertest";
import { getIn } from "../utils/TestDataHelper";

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  let kafka: Kafka;
  let consumer: Consumer;
  let uid: number;
  beforeEach(async () => {
    jest.clearAllMocks();
    uid = Date.now();
    mockConfigGet.mockImplementation((key: string) => {
      switch (key) {
        case "kafka":
          return {
            general: {
              brokers: ["localhost:9092"],
              clientId: "ab-e2e-clients",
              producerTopic: `ab-e2e-${uid}-producer.proto`,
            },
            producer: {
              maxInFlightRequests: 1,
            },
          } as IKafkaConfig;
        default:
          // Return actual value for all but above
          return jest.requireActual("config").get(key);
      }
    });
    const testKafkaConfig = {
      brokers: ["localhost:9092"],
      clientId: "ab-e2e-test-clients",
      consumerTopic: `ab-e2e-${uid}-producer.proto`,
    };
    const testKafkaConsumerConfig = {
      groupId: `ab-e2e-test-${uid}`,
    };
    kafka = new Kafka({
      logLevel: logLevel.INFO,
      brokers: testKafkaConfig.brokers,
      clientId: testKafkaConfig.clientId,
      logCreator: WinstonLogCreator,
    });
    consumer = kafka.consumer(testKafkaConsumerConfig);
    await consumer.connect();
    await consumer.subscribe({
      topic: testKafkaConfig.consumerTopic,
      fromBeginning: false,
    });
    server = new Server();
    await server.start();
    await waitAsync(4000); // Wait for Kafka groups to balance
  }, 10000);
  afterEach(async () => {
    await consumer.disconnect();
    await waitAsync(2000); // Wait for Kafka to fully disconnect
    await server.stop();
  }, 10000);

  it("Should transform messages", async () => {
    const pass = new PassThrough({ objectMode: true });
    const asyncIterable = pass[Symbol.asyncIterator]();
    // Setup Kafka consumer to verify messages are produced to Kafka from the application
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        pass.write({ topic, partition, message });
      },
    });
    // Generate some messages
    await request(serverUrl).post("/v1/convert").send(getIn()).expect(201, {
      fullName: "Prof. Proton",
      timestamp: 1540332453982,
    });

    // Verify the output
    const msg = await asyncIterable.next();
    expect(msg.value.topic).toEqual(`ab-e2e-${uid}-producer.proto`);
    const out = decode("Out", msg.value.message.value);
    expect(out).toEqual({
      fullName: "Prof. Proton",
      timestamp: 1540332453982,
    });
  }, 10000);
});
