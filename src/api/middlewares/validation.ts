import { ObjectSchema } from "@hapi/joi";
import { NextFunction, Request, Response } from "express";
import { getLogger } from "../../utils/Logging";
import * as Metrics from "../../utils/Metrics";

const logger = getLogger();

export const validationMiddleware = (
  schema: ObjectSchema,
  property: "body" | "query"
) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.validate(req[property]);
  const { error } = result;

  if (!!error) {
    Metrics.missingMandatoryFieldTotal.inc();
    // Need 2 logs here so we don't log any PII from request
    logger.warn("Invalid request was made");
    logger.debug(
      `Invalid request was made with body ${JSON.stringify(req[property])}`
    );
    res.status(400).json({
      message: "Invalid request",
      data: req.body,
    });
    return;
  }

  next();
};
