import Signals = NodeJS.Signals;
import { inspect } from "util";
import { App } from "./App";
import { formatError, getLogger } from "./utils/Logging";
import { checkEnv } from "./utils/Helpers";

export class Server {
  private logger = getLogger();
  private app: App;

  constructor() {
    checkEnv();
    this.app = new App();
  }

  stop = async (): Promise<void> => {
    await this.app.stop();
  };

  start = async (): Promise<void> => {
    try {
      await this.app.start();
      this.logger.info("Add signal handlers");
      const signals: Array<Signals> = ["SIGINT", "SIGTERM"];

      process.on("uncaughtException", async (err) => {
        this.logger.error(
          `An uncaught exception occurred ${formatError(
            err
          )}. Note: This should never happen, please fix this!`
        );
        await this.stop();
      });
      process.on("unhandledRejection", async (err) => {
        this.logger.error(
          `An uncaught rejection occurred ${inspect(
            err
          )}. Note: This should never happen, please fix this!`
        );
        await this.stop();
      });

      signals.forEach((signal: Signals) => {
        process.on(signal, async () => {
          this.logger.debug("Process is being terminated!");
          await this.stop();
        });
      });
    } catch (err) {
      this.logger.error(`Server could not be started ${formatError(err)}`);
      await this.stop();
    }
  };
}
