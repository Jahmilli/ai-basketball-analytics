import { Router, Request, Response } from "express";
import { inspect } from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import { validationMiddleware } from "../../middlewares/validation";
import { InSchema } from "../../schemas/InSchema";
import { NameConverterService } from "../../../services/NameConverterService";
import * as Metrics from "../../../utils/Metrics";
import { IRouter } from "../../../interfaces/IRouter";

export class V1Router implements IRouter {
  private readonly logger = getLogger();
  private readonly router: Router;
  private readonly prefix = "/v1";

  constructor(private readonly routines: NameConverterService) {
    this.router = this.setupRoutes();
  }

  setupRoutes(): Router {
    return Router().post(
      "/convert",
      validationMiddleware(InSchema, "body"),
      async (req: Request, res: Response) => {
        this.logger.debug(`Received request with body ${inspect(req.body)}`);
        Metrics.requestTotal.labels("/convert").inc();

        try {
          Metrics.requestErrorTotal.labels("/convert").inc();
          const result = await this.routines.convert(req.body);
          res.status(201).json(result);
        } catch (err) {
          this.logger.warn(
            `An error occurred when trying to convert name ${formatError(err)}`
          );
          res.sendStatus(500);
        }
      }
    );
  }

  getPrefix(): string {
    return this.prefix;
  }

  getRouter(): Router {
    return this.router;
  }
}
