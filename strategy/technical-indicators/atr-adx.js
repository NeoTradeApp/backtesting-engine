// Utility: Moving Average
function sma(values, period) {
  let result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += values[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

// True Range for ATR
function trueRange(high, low, close) {
  let tr = [];
  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      tr.push(high[i] - low[i]);
    } else {
      let hl = high[i] - low[i];
      let hc = Math.abs(high[i] - close[i - 1]);
      let lc = Math.abs(low[i] - close[i - 1]);
      tr.push(Math.max(hl, hc, lc));
    }
  }
  return tr;
}

// ATR
function atr(high, low, close, period = 14) {
  let tr = trueRange(high, low, close);
  return sma(tr, period);
}

// ADX (simplified)
function adx(high, low, close, period = 14) {
  let plusDM = [0], minusDM = [0];
  for (let i = 1; i < high.length; i++) {
    let upMove = high[i] - high[i - 1];
    let downMove = low[i - 1] - low[i];
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  let tr = trueRange(high, low, close);
  let ATR = sma(tr, period);

  let plusDI = plusDM.map((val, i) => 100 * (val / (ATR[i] || 1)));
  let minusDI = minusDM.map((val, i) => 100 * (val / (ATR[i] || 1)));

  let dx = plusDI.map((val, i) => {
    if (i === 0) return null;
    return (100 * Math.abs(val - minusDI[i])) / (val + minusDI[i] || 1);
  });

  return sma(dx, period); // ADX
}

// -------- Example Usage --------
const high = [102, 104, 103, 107, 108, 110];
const low = [99, 101, 100, 104, 105, 107];
const close = [100, 103, 102, 106, 107, 109];

const atr14 = atr(high, low, close, 14);
const adx14 = adx(high, low, close, 14);

console.log("ATR:", atr14);
console.log("ADX:", adx14);

// Simple regime classification
for (let i = 0; i < close.length; i++) {
  if (adx14[i] !== null) {
    if (adx14[i] > 25) {
      console.log(`Candle ${i}: Trending`);
    } else {
      console.log(`Candle ${i}: Choppy`);
    }
  }
}
