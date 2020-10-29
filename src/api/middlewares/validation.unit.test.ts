/* eslint-disable @typescript-eslint/ban-ts-comment */

import { validationMiddleware } from "./validation";
import { InSchema } from "../schemas/InSchema";
import { getIn } from "../../../test/utils/TestDataHelper";
import { NextFunction, Request, Response } from "express";

const jsonSpy = jest.fn();
const statusSpy = jest.fn();
const res = {
  status: (num: number) => {
    statusSpy(num);
    return {
      json: (body) => {
        jsonSpy(body);
      },
    };
  },
} as Response;

describe("Validate InSchema", () => {
  let req: Request;
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should correctly validate InSchema request", () => {
    const correctRequest = getIn();
    req = {
      body: correctRequest,
    } as Request;
    const nextSpy = jest.fn() as NextFunction;
    validationMiddleware(InSchema, "body")(req, res, nextSpy);
    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonSpy).not.toHaveBeenCalled();
    expect(nextSpy).toBeCalledTimes(1);
  });

  it.each(["name", "timestamp"])(
    "should respond with 400 and not call next if the InSchema request is missing %s",
    (field) => {
      const correctRequest = getIn();
      // @ts-ignore
      correctRequest[field] = undefined;
      req = {
        body: correctRequest,
      } as Request;
      const nextSpy = jest.fn() as NextFunction;
      validationMiddleware(InSchema, "body")(req, res, nextSpy);
      expect(statusSpy).toBeCalledWith(400);
      expect(jsonSpy).toBeCalledWith({
        data: req.body,
        message: "Invalid request",
      });
      expect(nextSpy).not.toHaveBeenCalled();
    }
  );
});
