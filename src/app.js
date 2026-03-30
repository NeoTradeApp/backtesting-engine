const { redisService, storeNifyFuturesService } = require("@services");

function App() {
  this.start = async () => {
    await redisService.connect();
    storeNifyFuturesService.start();
  };

  this.stop = async () => {
    await redisService.disconnect();
    storeNifyFuturesService.stop();
  };
}

module.exports = App;
