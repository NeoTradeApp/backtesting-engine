const { fork } = require('child_process');
const { appEvents } = require("@events");
const { EVENT } = require("@constants");
const { debounceWithBurst } = require("@utils");
const { redisService } = require("./redis");

function BacktestJob(backtestJobId, backtestJobData) {
  const { userId, serverId, params } = backtestJobData || {};

  const emitBacktestResultToEvents = debounceWithBurst((payload) => {
    appEvents.emit(EVENT.BACKTEST.UPDATE, serverId, {
      backtestJobId,
      userId,
      params,
      payload,
    });
  }, 1500);

  this.start = () => {
    const args = Object.entries(params).map(([key, value]) => `${key}=${value}`);
    const child = fork("./strategy/index.js", args);

    child.on("message", (data) => {
      emitBacktestResultToEvents((payload) => payload ? [...payload, data] : [data]);
    });

    child.on("exit", (testResults) => {
      appEvents.emit(EVENT.BACKTEST.COMPLETED, serverId, testResults);
    });
  };
}

const addEventListeners = () => {
  appEvents.onEvent(EVENT.BACKTEST.INITIATED, async (backtestJobId) => {
    const backtestJobData = await redisService.get(`backtest/${backtestJobId}`);
    new BacktestJob(backtestJobId, backtestJobData).start();
  });
}
addEventListeners();

module.exports = BacktestJob;
