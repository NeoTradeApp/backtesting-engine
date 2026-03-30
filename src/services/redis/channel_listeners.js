const { logger } = require("winston");
const { appEvents } = require("@events");
const { EVENT, REDIS, SCRIPS } = require("@constants");

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

const storeNiftyFutures = (candles) =>
  appEvents.emit(EVENT.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_FUTURE), JSON.parse(candles));

const storeNiftyIndex = (candles) => {
  appEvents.emit(EVENT.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_INDEX), JSON.parse(candles));
}

module.exports = {
  redisChannelListeners: {
    [REDIS.CHANNEL.KEY_SET]: keySetListener,
    [REDIS.CHANNEL.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_FUTURE)]: storeNiftyFutures,
    [REDIS.CHANNEL.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_INDEX)]: storeNiftyIndex,
  },
};
