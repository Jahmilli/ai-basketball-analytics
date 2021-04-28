import config from "config";
import { V1Router } from "./api/routes/v1";
import { ExpressWrapper } from "./components/ExpressWrapper";
import { AnalyticsService } from "./services/AnalyticsService";
import { getLogger } from "./utils/Logging";
import Database from "./components/Database";

export class App {
  private logger = getLogger();
  private expressWrapper = new ExpressWrapper();
  private db = new Database("video-connection");
  private analyticsService = new AnalyticsService(this.db);

  constructor() {
    const v1Router = new V1Router(this.analyticsService, this.db);
    this.expressWrapper.addRouter(v1Router);
  }

  async start(): Promise<void> {
    this.logger.info("Starting App");
    await this.db.start();
    await this.expressWrapper.start(config.get("api.port"));
    this.logger.info("Started App");
  }

  async stop(): Promise<void> {
    this.logger.info("Stopping App");
    await this.expressWrapper.stop();
    await this.db.stop();
    this.logger.info("Stopped App");
  }
}
