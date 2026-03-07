const optionEngine = require("./optionEngine");
const masterEngine = require("./masterEngine");

function analyze(symbol){

  const optionData = optionEngine.getOptionChain(symbol);

  const systemState = masterEngine.getSystemState();

  if(!optionData) return null;

  let totalCE_OI = 0;
  let totalPE_OI = 0;

  optionData.forEach(row => {

    if(row.CE){
      totalCE_OI += row.CE.openInterest || 0;
    }

    if(row.PE){
      totalPE_OI += row.PE.openInterest || 0;
    }

  });

  const PCR = totalPE_OI / totalCE_OI;

  let signal = "NEUTRAL";

  if(PCR > 1.3){
    signal = "STRONG BULLISH";
  }

  else if(PCR > 1.05){
    signal = "BULLISH";
  }

  else if(PCR < 0.7){
    signal = "STRONG BEARISH";
  }

  else if(PCR < 0.95){
    signal = "BEARISH";
  }

  return {

    symbol: symbol,

    ATM: systemState[symbol + "_ATM"],

    CE_OI: totalCE_OI,

    PE_OI: totalPE_OI,

    PCR: PCR,

    signal: signal

  };

}

module.exports = {
  analyze
};
