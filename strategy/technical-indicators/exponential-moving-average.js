const { EMA_PERIOD, TRENDS_CANDLE_COUNT } = require("../config");

const emaArray = [];

const periodicPush = (ema, maxLength) => {
  const max = (a, b) => a > b ? a : b;

  emaArray.push(ema);

  if (emaArray.length > max(max(maxLength, EMA_PERIOD), TRENDS_CANDLE_COUNT)) {
    emaArray.shift();
  }

  return emaArray;
};

const eMovingAverage = (price, period = EMA_PERIOD) => {
  if (emaArray.length < period) {
    periodicPush(price, period);
    const sum = emaArray.reduce((sum, ema) => sum + ema, 0);

    return sum / emaArray.length;
  }

  const k = 2 / (period + 1);
  const emaYesterday = emaArray[emaArray.length - 1];
  const emaToday = price * k + emaYesterday * (1 - k);
  periodicPush(emaToday, period);

  return emaToday
};

const getTrendFromEma = () => {
  if (!emaArray.length) return 0;

  const firstEma = (emaArray.length > TRENDS_CANDLE_COUNT && emaArray[emaArray.length - TRENDS_CANDLE_COUNT]) || emaArray[0];
  const latestEma = emaArray[emaArray.length - 1];

  return latestEma >= firstEma ? "uptrend" : "downtrend";
}

const resetEMovingAverage = () => {
  emaArray.length = 0;
}

module.exports = {
  eMovingAverage,
  resetEMovingAverage,
  getTrendFromEma,
};
