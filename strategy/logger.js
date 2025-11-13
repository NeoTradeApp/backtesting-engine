const { DEBUG_TRADES } = require("./config");

const logInfo = (...params) => {
  // console.log(...params);
}

const debug = (...params) => DEBUG_TRADES && logInfo(...params);

module.exports = { logInfo, debug };
