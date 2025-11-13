const eventKeys = require("./event_keys");
const redisKeys = require("./redis_keys");

module.exports = {
  ...eventKeys,
  ...redisKeys,
};
