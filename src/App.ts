import { getLogger } from "./utils/Logging";
import config from "config";
import { ExpressWrapper } from "./components/ExpressWrapper";
import { KafkaProducer } from "./components/KafkaProducer";
import { V1Router } from "./api/routes/v1";
import { NameConverterService } from "./services/NameConverterService";

export class App {
  private logger = getLogger();
  private expressWrapper = new ExpressWrapper();
  private kafkaProducer = new KafkaProducer();

  /**
   * Only add static code to constructor to make unit testing possible.
   */
  constructor() {
    const routines = new NameConverterService(this.kafkaProducer);
    const v1Router = new V1Router(routines);
    this.expressWrapper.addRouter(v1Router);
  }

  async start(): Promise<void> {
    this.logger.info("Starting App");
    await this.kafkaProducer.start();
    await this.expressWrapper.start(config.get("api.port"));
    this.logger.info("Started App");
  }

  async stop(): Promise<void> {
    this.logger.info("Stopping App");
    await this.expressWrapper.stop();
    await this.kafkaProducer.stop();
    this.logger.info("Stopped App");
  }
}
