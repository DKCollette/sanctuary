export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    const entry = { level: "info", message, timestamp: new Date().toISOString(), ...data };
    if (process.env.NODE_ENV !== "test") console.log(JSON.stringify(entry));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    const entry = { level: "warn", message, timestamp: new Date().toISOString(), ...data };
    console.warn(JSON.stringify(entry));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    const entry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
      ...data,
    };
    console.error(JSON.stringify(entry));
  },
};