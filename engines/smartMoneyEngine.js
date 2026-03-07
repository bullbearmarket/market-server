const optionEngine = require("./optionEngine");

function detectSmartMoney(symbol){

  const optionData = optionEngine.getOptionChain(symbol);

  if(!optionData) return null;

  let ceVolume = 0;
  let peVolume = 0;

  let ceOI = 0;
  let peOI = 0;

  optionData.forEach(row => {

    if(row.CE){
      ceVolume += row.CE.totalTradedVolume || 0;
      ceOI += row.CE.openInterest || 0;
    }

    if(row.PE){
      peVolume += row.PE.totalTradedVolume || 0;
      peOI += row.PE.openInterest || 0;
    }

  });

  let action = "NEUTRAL";

  if(peVolume > ceVolume * 1.3){
    action = "SMART MONEY BUYING";
  }

  else if(ceVolume > peVolume * 1.3){
    action = "SMART MONEY SELLING";
  }

  return {

    symbol: symbol,

    CE_VOLUME: ceVolume,

    PE_VOLUME: peVolume,

    CE_OI: ceOI,

    PE_OI: peOI,

    action: action

  };

}

module.exports = {
  detectSmartMoney
};
