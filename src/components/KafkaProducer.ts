import { Kafka, Producer } from "kafkajs";
import config from "config";
import * as Metrics from "../utils/Metrics";
import { formatError, getLogger, WinstonLogCreator } from "../utils/Logging";
import { IKafkaConfig } from "../interfaces/IConfig";

export class KafkaProducer {
  private readonly logger = getLogger();
  private readonly producer: Producer;
  private readonly kafkaConfig: IKafkaConfig = config.get("kafka");
  private readonly kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      brokers: this.kafkaConfig.general.brokers,
      clientId: this.kafkaConfig.general.clientId,
      logCreator: WinstonLogCreator,
    });
    this.logger.debug(
      `Got kafkaConfig in Kafka Producer: ${JSON.stringify(this.kafkaConfig)}`
    );
    this.producer = this.getNewProducer();
  }

  private getNewProducer(): Producer {
    return this.kafka.producer({
      maxInFlightRequests: this.kafkaConfig.producer.maxInFlightRequests,
    });
  }

  /* Start Functions */
  async start(): Promise<void> {
    await this.producer.connect();
    this.logger.info("Started Kafka Producer");
  }

  async stop(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.logger.info("Stopped Kafka Producer");
    } catch (err) {
      this.logger.warn(
        `Error when trying to disconnect Kafka Producer ${formatError(err)}`
      );
    }
  }

  async send(proto: Uint8Array): Promise<void> {
    try {
      // Publish Out message to target topic
      this.logger.info(
        `Writing message to topic ${this.kafkaConfig.general.producerTopic}`
      );
      await this.producer.send({
        topic: this.kafkaConfig.general.producerTopic,
        messages: [{ value: Buffer.from(proto) }],
      });
      Metrics.kafkaProduceSuccessTotal.inc();
    } catch (err) {
      Metrics.kafkaProduceErrorTotal.inc();
      this.logger.warn(
        `An error occurred when producing to Kafka ${formatError(err)}`
      );
      throw err;
    }
  }
}
