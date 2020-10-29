import { Request, Response, Router } from "express";
import { inspect } from "util";
import { IRouter } from "../../../interfaces/IRouter";
import { AnalyticsService } from "../../../services/AnalyticsService";
import { formatError, getLogger } from "../../../utils/Logging";
import { validationMiddleware } from "../../middlewares/validation";
import { InSchema } from "../../schemas/InSchema";

export class V1Router implements IRouter {
  private readonly logger = getLogger();
  private readonly router: Router;
  private readonly prefix = "/v1";

  constructor(private readonly analyticsService: AnalyticsService) {
    this.router = this.setupRoutes();
  }

  setupRoutes(): Router {
    return Router().post(
      "/convert",
      // validationMiddleware(InSchema, "body"),
      async (req: Request, res: Response) => {
        this.logger.debug(`Received request with body ${inspect(req.body)}`);

        try {
          const result = await this.analyticsService.convert(req.body);
          res.status(200).json(result);
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
