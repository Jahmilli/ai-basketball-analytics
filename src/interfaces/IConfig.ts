export interface IKafkaGeneralConfig {
  clientId: string;
  brokers: string[];
  producerTopic: string;
}

export interface IKafkaProducerConfig {
  maxInFlightRequests: number;
}

export interface IKafkaConfig {
  general: IKafkaGeneralConfig;
  producer: IKafkaProducerConfig;
}

export interface IApiConfig {
  port: number;
}

export interface IPrometheusConfig {
  port: number;
}
