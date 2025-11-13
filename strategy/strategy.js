const { debug } = require("./logger");

// const moment = require("moment");
// const { delay } = require("./delay");

const {
  LOT_SIZE,
  NUM_OF_LOTS,
  TAX_AND_BROKERAGE_PER_TRADE,
  TARGET,
  TRAILING_STOPLOSS,
  TRAIL_STOPLOSS_AT_MARKET_MOVEMENT,
  VIRTUAL_TARGET,
  STOPLOSS,
  DAY_STOPLOSS,
  DAY_TARGET,
  NUM_OF_TRADE_IN_A_DAY,
  START_DAY_TRADE_AFTER_MINUTES,
  DURATION_BETWEEN_TRADES_IN_MINUTES,
  TRADE_DECISION,
  FIRST_MOCK_TRADE,
  TREND_FOLLOWER,
  MEAN_REVERSION,
  MEAN_REVERSION_THRESHOLD,
  TIME_VARIANCE,
  WAIT_FOR_PULLBACK,
} = require("./config");

const formattedDate = (date) => date ? `${date.format("MMM DD, YYYY ddd HH:mm:ss")}` : "";

const withVariance = (value) => value + parseInt(Math.random() * TIME_VARIANCE);

const tradeDecisionByEMA = (tradeCandle) => {
  // Mean Reversion
  if (MEAN_REVERSION) {
    if (tradeCandle?.open - tradeCandle?.ema > MEAN_REVERSION_THRESHOLD) {
      debug("Mean reversion SELL");
      return -1;
    } else if (tradeCandle?.ema - tradeCandle?.open > MEAN_REVERSION_THRESHOLD) {
      debug("Mean reversion BUY");
      return 1;
    }
  }

  const trend = tradeCandle?.trend;
  if (trend === "uptrend") {
    return 1;
  } else if (trend === "downtrend") {
    return -1;
  }
};

const tradeDecisionBySmA = (tradeCandle) => {
  if (tradeCandle?.sma) {
    const { open, sma } = tradeCandle;
    return open > sma ? 1 : -1;
  }
};

const tradeDecisionByPreviousTrade = (recentTrade) => {
  if (recentTrade?.stoplossHit) {
    return recentTrade.buyOrSell * -1;
  } else if (recentTrade?.targetHit) {
    return recentTrade.buyOrSell;
    // return recentTrade.buyOrSell * -1;
  }
}

const tradeDecisionBySmaOrPreviousTrade = (recentTrade, tradeCandle) => {
  if (recentTrade) {
    return tradeDecisionByPreviousTrade(recentTrade);
  } else if (tradeCandle?.sma) {
    return tradeDecisionBySmA(tradeCandle);
  }
};

const tradeDecisionByEmaOrPreviousTrade = (recentTrade, tradeCandle) => {
  if (recentTrade) {
    return tradeDecisionByPreviousTrade(recentTrade);
  } else if (tradeCandle?.ema) {
    return tradeDecisionByEMA(tradeCandle);
  }
}

const randomTradeDecision = () => {
  const randomNumber = (n) => parseInt(Math.random() * n);

  const random100 = randomNumber(100);
  return random100 > 50 ? 1 : -1; // 1 => buy and -1 => sell
};

const tradeDecision = (previousTrades, tradeCandle) => {
  const recentTrade = previousTrades[previousTrades.length - 1];
  // const previousToRecent = previousTrades[previousTrades.length - 2];

  let decision;
  switch (TRADE_DECISION) {
    case "sma":
      decision = tradeDecisionBySmA(tradeCandle);
      break;

    case "emap":
      decision = tradeDecisionByEmaOrPreviousTrade(recentTrade, tradeCandle);
      break;

    case "ema":
      decision = tradeDecisionByEMA(tradeCandle);
      break;

    case "smap":
      decision = tradeDecisionBySmaOrPreviousTrade(recentTrade, tradeCandle);
      break;

    case "p":
      decision = tradeDecisionByPreviousTrade(recentTrade);
      break;

    case "random":
      decision = randomTradeDecision();
      break;
  }

  decision ||= randomTradeDecision();

  return decision;
};

const trade = (candlesData, target, initialStoploss, initialTrailingStoploss, previousTrades = []) => {
  let stoploss = initialStoploss;
  let trailingStoploss = initialTrailingStoploss;

  const buyOrSell = tradeDecision(previousTrades, candlesData[0]);
  const { open: tradePrice } = candlesData[0];

  const checkPnl = (currentPrice, high, low) => {
    if (buyOrSell === 1) {
      if (low - tradePrice <= stoploss) return stoploss;
      if (high - tradePrice >= target) return target;
    } else if (buyOrSell === -1) {
      if (tradePrice - high <= stoploss) return stoploss;
      if (tradePrice - low >= target) return target;
    }

    return (currentPrice - tradePrice) * buyOrSell;
  }

  let pnl = 0;
  let index = 0;
  let tradeDetails = {};
  for (index = 0; index < candlesData.length; index++) {
    const { close: currentPrice, high, low, date, trend } = candlesData[index];
    pnl = checkPnl(currentPrice, high, low);

    tradeDetails = { buyOrSell, tradePrice, exitPrice: currentPrice };
    if (pnl <= stoploss) {
      return { pnl: stoploss, index, stoplossHit: 1, ...tradeDetails };
    }

    if (TREND_FOLLOWER) {
      if ((buyOrSell === 1 && trend === "downtrend") || (buyOrSell === -1 && trend === "uptrend")) {
        return { pnl, index, stoplossHit: 1, ...tradeDetails };
      }
    }

    if (pnl >= target) {
      return { pnl: target, index, targetHit: 1, ...tradeDetails };
    }

    if (trailingStoploss && pnl >= trailingStoploss) {
      const newStoploss = trailingStoploss >= VIRTUAL_TARGET
        ? (trailingStoploss - Math.abs(STOPLOSS))
        : (trailingStoploss - TRAILING_STOPLOSS);

      if (newStoploss > stoploss) {
        stoploss = newStoploss;
      }
      trailingStoploss += TRAIL_STOPLOSS_AT_MARKET_MOVEMENT;
    }
  }

  return { pnl, index, ...tradeDetails };
}

const mockTrade = (candlesData) => {
  const {
    index,
    buyOrSell,
    targetHit,
    stoplossHit,
    tradePrice,
    exitPrice,
  } = trade(candlesData, 50, -50, 10000);

  debug(
    "MOCK FIRST TRADE",
    buyOrSell === 1 ? "BUY" : "SELL",
    `| Target: ${targetHit || 0}`,
    `| Stoploss: ${stoplossHit || 0}`,
    `| NIFTY: ${tradePrice} - ${exitPrice}`,
  );

  return {
    index,
    buyOrSell, //: buyOrSell * (50 / (startIndex - START_DAY_TRADE_AFTER_MINUTES) > 3.33 ? -1 : 1),
    targetHit,
    stoplossHit,
  }
};

const waitForPullbackCloseToEma = (candlesData, index) => {
  const anyOneCloser = (...diffs) => diffs.some(d => Math.abs(d) <= Math.abs(STOPLOSS));

  let i;
  for (i = index; i < candlesData.length; i++) {
    const { open, close, high, low, ema } = candlesData[i];

    if (anyOneCloser(ema - open, ema - close, ema - high, ema - low)) {
      break;
    }
  }

  debug(
    `Wait for pullback: ${formattedDate(candlesData[index]?.date)} - ${formattedDate(candlesData[i]?.date)}`,
    `(${candlesData[index]?.trend}, ${candlesData[i]?.trend})`,
  );

  return i;
}

const backtestIntraday = (data = []) => {
  if (!data.length) return;

  const previousTrades = [];
  let candlesData = data.slice(withVariance(START_DAY_TRADE_AFTER_MINUTES));

  // Intial wait for the market to move either side 50 points.
  if (FIRST_MOCK_TRADE) {
    const { index: startIndex, buyOrSell, targetHit, stoplossHit } = mockTrade(candlesData);
    candlesData = candlesData.slice(startIndex + 1);
    previousTrades.push({ buyOrSell, targetHit, stoplossHit });
  }

  debug(
    `Date: ${formattedDate(candlesData[0]?.date)} - ${formattedDate(candlesData[candlesData.length - 1]?.date)}`
  );

  const calculateAmount = (priceChange) => LOT_SIZE * NUM_OF_LOTS * priceChange;

  let dayPnl = 0;
  let index = 0;
  let stoplossCount = 0;
  let targetCount = 0;
  let totalTrades = 0;
  for (index = 0; index < candlesData.length; index++) {
    if (WAIT_FOR_PULLBACK) {
      index = waitForPullbackCloseToEma(candlesData, index) + 1;
      if (index >= candlesData.length) break;
    }

    const tradeResult = trade(candlesData.slice(index), TARGET, STOPLOSS, TRAIL_STOPLOSS_AT_MARKET_MOVEMENT, previousTrades);
    totalTrades += 1;
    const {
      pnl,
      index: nextIndex,
      buyOrSell,
      targetHit,
      stoplossHit,
      tradePrice,
      exitPrice,
    } = tradeResult;

    dayPnl += calculateAmount(pnl) - TAX_AND_BROKERAGE_PER_TRADE;

    debug(`${formattedDate(candlesData[index]?.date)} - ${formattedDate(candlesData[index + nextIndex]?.date)}`);
    debug(
      "TRADE",
      buyOrSell === 1 ? "BUY" : "SELL",
      pnl,
      `| Day's P&L: ${dayPnl}`,
      `| NIFTY: ${tradePrice} - ${exitPrice}`,
      `| EMA: ${candlesData[index]?.ema?.toFixed(2)} - ${candlesData[index + nextIndex]?.ema?.toFixed(2)}`,
      `(${candlesData[index]?.trend})`,
      `| SMA: ${candlesData[index]?.sma?.toFixed(2)}`
    );

    // wait for few minute before executing next trade.
    index += nextIndex + withVariance(DURATION_BETWEEN_TRADES_IN_MINUTES);

    stoplossCount += stoplossHit || 0;
    targetCount += targetHit || 0;
    // previousTrade = tradeResult;
    previousTrades.push(tradeResult);
    if (previousTrades.length > 2) {
      previousTrades.shift();
    }

    if (DAY_STOPLOSS && dayPnl < DAY_STOPLOSS) break;
    if (DAY_TARGET && dayPnl > DAY_TARGET) break;
  }

  return {
    pnl: dayPnl,
    targetCount,
    stoplossCount,
    totalTrades,
  };
};

module.exports = {
  backtestIntraday,
}
