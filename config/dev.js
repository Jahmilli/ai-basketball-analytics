module.exports = {
  kafka: {
    general: {
      brokers: ["localhost:9092"],
      producerTopic: "local-dev-ai-basketball-analytics-out.proto",
    },
  },
  prometheus: {
    port: 0, // Dynamically allocate port to avoid conflict
  },
};
