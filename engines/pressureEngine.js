const optionEngine = require("./optionEngine");

function calculatePressure(symbol){

  const data = optionEngine.getOptionChain(symbol);

  if(!data) return null;

  let callVolume = 0;
  let putVolume = 0;

  data.forEach(row => {

    if(row.CE){
      callVolume += row.CE.totalTradedVolume || 0;
    }

    if(row.PE){
      putVolume += row.PE.totalTradedVolume || 0;
    }

  });

  const total = callVolume + putVolume;

  const buyPressure = ((putVolume / total) * 100).toFixed(2);
  const sellPressure = ((callVolume / total) * 100).toFixed(2);

  let sentiment = "NEUTRAL";

  if(buyPressure > 60){
    sentiment = "BULLISH";
  }

  if(sellPressure > 60){
    sentiment = "BEARISH";
  }

  return {

    symbol: symbol,

    BUY_PRESSURE: buyPressure,

    SELL_PRESSURE: sellPressure,

    sentiment: sentiment

  };

}

module.exports = {
  calculatePressure
};
