import { Request, Response, Router } from "express";
import { inspect } from "util";
import { IRouter } from "../../../interfaces/IRouter";
import { AnalyticsService } from "../../../services/AnalyticsService";
import { formatError, getLogger } from "../../../utils/Logging";
import { validationMiddleware } from "../../middlewares/validation";
import { InSchema } from "../../schemas/InSchema";
import Database from "../../../components/Database";

export class V1Router implements IRouter {
  private readonly logger = getLogger();
  private readonly router: Router;
  private readonly prefix = "/v1";

  constructor(
    private readonly analyticsService: AnalyticsService,
    readonly database: Database
  ) {
    this.router = this.setupRoutes();
  }

  setupRoutes(): Router {
    const router = Router();
    router.post(
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
    router.get("/getScores", async (req: Request, res: Response) => {
      try {
        const results = await this.database.getAllPlayerScores();
        res.status(200).json(results);
      } catch (err) {
        this.logger.warn(
          `An error occurred when trying to convert name ${formatError(err)}`
        );
        res.sendStatus(500);
      }
    });

    router.get("/getLastScore", async () => {
      return await this.database.getLastScore();
    });
    
    return router;
  }

  getPrefix(): string {
    return this.prefix;
  }

  getRouter(): Router {
    return this.router;
  }
}
