import Signals = NodeJS.Signals;
import express, { Express, Request, Response } from "express";
import * as Prometheus from "prom-client";
import { formatError, getLogger } from "./utils/Logging";
import config from "config";
import { inspect, promisify } from "util";
import * as Metrics from "./utils/Metrics";
import * as http from "http";
import { App } from "./App";

export class Server {
  private logger = getLogger();
  private app: App;
  private server: http.Server;

  constructor() {
    this.app = new App();
    const ex = this.setupExpress();
    this.server = this.setupHttpServer(ex);

    // TODO: Add any environment variable checks here
  }

  setupHttpServer(ex: Express): http.Server {
    const server = http.createServer(ex);
    server.on("error", (err) => {
      this.logger.warn(formatError(err));
    });
    this.logger.info("Setup HTTP Server");
    return server;
  }

  setupExpress(): Express {
    return express()
      .get("/metrics", (req: Request, res: Response) => {
        res.set("Content-Type", Prometheus.register.contentType);
        res.end(Prometheus.register.metrics());
      })
      .get("/healthz", (req: Request, res: Response) => {
        this.logger.info("/healthz initiated");
        res.send("ok");
      });
  }

  async startPrometheus(): Promise<void> {
    /**
     * Initialise Prometheus and Express to serve metrics
     */
    if (process.env.NODE_ENV !== "test") {
      // This can only be executed once and fails when running System Tests
      Prometheus.collectDefaultMetrics();
    }
    await promisify(this.server.listen).bind(this.server)(
      config.get("prometheus.port")
    );
    const address = this.server.address() as { port: number };
    this.logger.info(`Prometheus metrics started on port ${address}`);

    // Record any build information (GIT_COMMIT is set in Dockerfile)
    Metrics.appBuildInfo.set({ commit: `${process.env.GIT_COMMIT}` }, 1);
  }

  stopExpressPrometheus = async (): Promise<void> => {
    try {
      // stop the server in a graceful manner
      this.logger.info("Stopping Express server and Prometheus...");
      await promisify(this.server.close).bind(this.server)();
      this.logger.info("Stopped Express server and Prometheus");
    } catch (err) {
      this.logger.warn(
        `Failed to stop Express server and Prometheus: ${formatError(err)}`
      );
    }
  };

  stop = async (): Promise<void> => {
    await this.app.stop();
    await this.stopExpressPrometheus();
  };

  start = async (): Promise<void> => {
    try {
      this.startPrometheus();
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
