/**
 * A simple logger that is a no-op in production.
 */
const noOp = () => {};

const createLogger = () => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };
  }

  return {
    log: noOp,
    warn: noOp,
    error: noOp,
  };
};

export const logger = createLogger();
