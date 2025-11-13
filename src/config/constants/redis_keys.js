const KEY = {
};

const databaseIndex = 0;
const CHANNEL = {
  KEY_SET: `__keyevent@${databaseIndex}__:set`,
  BACKTEST: (serverId) => `REDIS/CHANNEL/BACKTEST/${serverId}`,
};

module.exports = {
  REDIS: {
    KEY,
    CHANNEL,
  },
};
