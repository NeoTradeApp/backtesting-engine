const moment = require("moment");
const { EVENT, SCRIPS } = require("@constants")
const { NiftyFuture } = require("@models");
const MarketDataStoreService = require("./market_data_store_service");

function StoreNifyFuturesService(scrip) {
  MarketDataStoreService.call(this, scrip);

  this.onMarketFeed = async (candles) => {
    await NiftyFuture.bulkCreate(candles, {
      updateOnDuplicate: ["time", "open", "high", "low", "close", "volume"],
    });
  };
}

module.exports = { storeNifyFuturesService: new StoreNifyFuturesService(SCRIPS.SCRIP_TYPE.NIFTY_FUTURE) };
