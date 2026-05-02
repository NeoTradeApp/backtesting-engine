const KEY = {
  BACKTEST: (backtestJobId) => `REDIS/KEY/BACKTEST/${backtestJobId}`,
};

const databaseIndex = 0;
const CHANNEL = {
  KEY_SET: `__keyevent@${databaseIndex}__:set`,
  BACKTEST: (serverId) => `REDIS/CHANNEL/BACKTEST/${serverId}`,
  STORE_MARKET_FEED: (SCRIP) => `REDIS/CHANNEL/STORE_MARKET_FEED/${SCRIP}`,
};

module.exports = {
  REDIS: {
    KEY,
    CHANNEL,
  },
};
