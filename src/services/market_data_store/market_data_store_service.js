const moment = require("moment");
const { appEvents } = require("@events")
const { EVENT } = require("@constants")

function MarketDataStoreService(scrip) {
  this.scrip = scrip;

  let removeMarketFeedEvent;

  this.start = () => {
    if (removeMarketFeedEvent) return;

    removeMarketFeedEvent = appEvents.onEvent(EVENT.STORE_MARKET_FEED(this.scrip), this.onMarketFeed);
  }

  this.stop = () => {
    if (!removeMarketFeedEvent) return;

    removeMarketFeedEvent();
    removeMarketFeedEvent = null;
  }
}

module.exports = MarketDataStoreService;
