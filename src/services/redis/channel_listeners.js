const { logger } = require("winston");
const { appEvents } = require("@events");
const { EVENT, REDIS } = require("@constants");

const keySetListenerMappings = {
  [`^backtest\/[\\w-]+$`]: (key) => {
    const [, backtestJobId] = key.split("/");
    return appEvents.emit(EVENT.BACKTEST.INITIATED, backtestJobId);
  },

  default: (key) => logger.warning("Redis: Unhandled key set event", key),
};

const keySetListener = (key) => {
  const match = Object.keys(keySetListenerMappings).find((_) =>
    key.match(_)
  );
  const listener = keySetListenerMappings[match || "default"];
  return listener && listener(key);
};

module.exports = {
  redisChannelListeners: {
    [REDIS.CHANNEL.KEY_SET]: keySetListener,
  },
};
