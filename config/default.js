module.exports = {
  kafka: {
    general: {
      clientId: "ai-basketball-analytics",
      // brokers: [], // Array of Kafka brokers
      // producerTopic: "" // Topic to produce messages to
    },
    producer: {
      maxInFlightRequests: 1,
    },
  },
  api: {
    port: 3001,
  },
  prometheus: {
    port: 9898,
  },
};
