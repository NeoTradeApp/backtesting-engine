const {
  redisService,
} = require("@services");

function App() {
  this.start = async () => {
    await redisService.connect();
  };

  this.stop = async () => {
    database.disconnect();
    await redisService.disconnect();
  };
}

module.exports = App;
