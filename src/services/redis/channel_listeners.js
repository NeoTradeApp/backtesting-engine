const { logger } = require("winston");
const { appEvents } = require("@events");
const { EVENT, REDIS, SCRIPS } = require("@constants");

const keySetListenerMappings = {
  [REDIS.KEY.BACKTEST(`([\\w-_]+)$`)]: (keys) => {
    const [backtestJobId] = keys || [];
    return backtestJobId && appEvents.emit(EVENT.BACKTEST.INITIATED, backtestJobId);
  },
};

// const unhandledKeyExpiryWarning = (key) => logger.warning("Redis: Unhandled key expiry event", key);
// const unhandledKeySetWarning = (key) => logger.warning("Redis: Unhandled key set event", key);
const unhandledKeySetWarning = () => {};

const keyListener = (listenerMappings, unhandledWarning) => (key) => {
  Object.entries(listenerMappings).forEach(([regex, handler]) => {
    const [firstMatch] = Array.from(key.matchAll(new RegExp(regex, "g")));
    if (!firstMatch) return unhandledWarning(key);

    const [patternIsMatching, ...keys] = firstMatch;
    if (patternIsMatching) {
      handler && handler(keys);
    } else {
      unhandledWarning(key);
    }
  });
};

const storeNiftyFutures = (candles) =>
  appEvents.emit(EVENT.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_FUTURE), JSON.parse(candles));

const storeNiftyIndex = (candles) => {
  appEvents.emit(EVENT.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_INDEX), JSON.parse(candles));
}

module.exports = {
  redisChannelListeners: {
    [REDIS.CHANNEL.KEY_SET]: keyListener(keySetListenerMappings, unhandledKeySetWarning),
    [REDIS.CHANNEL.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_FUTURE)]: storeNiftyFutures,
    [REDIS.CHANNEL.STORE_MARKET_FEED(SCRIPS.SCRIP_TYPE.NIFTY_INDEX)]: storeNiftyIndex,
  },
};
