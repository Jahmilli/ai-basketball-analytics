const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet,
  };
});

import { Server } from "../../src/Server";
import { waitAsync } from "../utils/TestHelper";
import request from "supertest";

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigGet.mockImplementation((key: string) => {
      // Return actual value for all but above
      return jest.requireActual("config").get(key);
    });
    server = new Server();
    await server.start();
  }, 10000);
  afterEach(async () => {
    await waitAsync(2000); // Wait for Kafka to fully disconnect
    await server.stop();
  }, 10000);

  it("Should transform messages", async () => {
    // Generate some messages
    await request(serverUrl)
      .post("/v1/convert")
      .send({
        // TODO: Input Data goes here
      })
      .expect(200, {
        fullName: "Prof. Proton",
        timestamp: 1540332453982,
      });
  }, 10000);
});
