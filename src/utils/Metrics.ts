import * as Prometheus from "prom-client";

/**
 * Naming convention: https://prometheus.io/docs/practices/naming/
 */
export const appBuildInfo = new Prometheus.Gauge({
  name: "app_build_info",
  labelNames: ["commit"],
  help: "Application Build Information",
});
export const toProtoBufErrorTotal = new Prometheus.Counter({
  name: "ab_to_protobuf_error_total",
  help: "Number of errors when converting from object to ProtoBuf",
});
export const kafkaProduceErrorTotal = new Prometheus.Counter({
  name: "ab_kafka_produce_error_total",
  help: "Number of errors when performing a Kafka produce",
});
export const kafkaProduceSuccessTotal = new Prometheus.Counter({
  name: "ab_kafka_produce_success_total",
  help: "Number of successes when performing a Kafka produce",
});
export const requestTotal = new Prometheus.Counter({
  name: "ab_web_request_total",
  help: "Total number of web requests",
  labelNames: ["route"],
});
export const requestErrorTotal = new Prometheus.Counter({
  name: "ab_web_request_error_total",
  help: "Total number of errors when processing a request",
  labelNames: ["route"],
});
export const missingMandatoryFieldTotal = new Prometheus.Counter({
  name: "ab_missing_mandatory_error_total",
  help: "Number of errors reported due to mandatory fields missing in req",
});
