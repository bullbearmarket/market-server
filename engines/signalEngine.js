const analyzerEngine = require("./analyzerEngine");

function generateSignal(symbol){

  const analysis = analyzerEngine.analyze(symbol);

  if(!analysis) return null;

  const pcr = analysis.PCR;

  let bullPower = 50;
  let bearPower = 50;
  let bias = "NEUTRAL";

  if(pcr > 1.3){
    bullPower = 80;
    bearPower = 20;
    bias = "STRONG BULLISH";
  }

  else if(pcr > 1.05){
    bullPower = 65;
    bearPower = 35;
    bias = "BULLISH";
  }

  else if(pcr < 0.7){
    bullPower = 20;
    bearPower = 80;
    bias = "STRONG BEARISH";
  }

  else if(pcr < 0.95){
    bullPower = 35;
    bearPower = 65;
    bias = "BEARISH";
  }

  return {

    symbol: symbol,

    ATM: analysis.ATM,

    PCR: analysis.PCR,

    bullPower: bullPower,

    bearPower: bearPower,

    bias: bias

  };

}

module.exports = {
  generateSignal
};
