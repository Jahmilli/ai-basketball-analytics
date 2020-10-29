import { logLevel, LogEntry } from "kafkajs";
import { createLogger, format, Logger, transports } from "winston";
const { combine, timestamp, json } = format;

export const formatError = (err: Error | string): string => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  } else {
    return err;
  }
};

export const getLogger = (): Logger => {
  return createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), json()),
    transports: [
      new transports.Console({
        silent: process.env.NODE_ENV === "test" && !process.env.LOG_LEVEL,
      }),
    ],
  });
};

const toWinstonLogLevel = (level: logLevel): string => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
  }
};

export const WinstonLogCreator = (
  logLevel: logLevel
): ((entry: LogEntry) => void) => {
  const logger = getLogger();

  return (entry: LogEntry): void => {
    const { message, ...extra } = entry.log;
    logger.log({
      level: toWinstonLogLevel(entry.level),
      message,
      extra,
    });
  };
};
