
const strikeEngine = require("./strikeEngine");
const optionEngine = require("./optionEngine");

let systemState = {
  NIFTY_ATM: null,
  BANKNIFTY_ATM: null
};

function detectATM(price, step){

  return Math.round(price / step) * step;

}

function startMasterEngine(){

  setInterval(() => {


    if(!market.NIFTY || !market.BANKNIFTY) return;

    const niftyATM = detectATM(market.NIFTY, 50);
    const bankniftyATM = detectATM(market.BANKNIFTY, 100);

    systemState.NIFTY_ATM = niftyATM;
    systemState.BANKNIFTY_ATM = bankniftyATM;

    strikeEngine.buildLadder("NIFTY", niftyATM);
    strikeEngine.buildLadder("BANKNIFTY", bankniftyATM);
optionEngine.fetchOptionChain("NIFTY", systemState.NIFTY_ATM);
optionEngine.fetchOptionChain("BANKNIFTY", systemState.BANKNIFTY_ATM);
    
    console.log("ATM Updated", systemState);

  }, 10000);

}

function getSystemState(){

  return systemState;

}

module.exports = {
  startMasterEngine,
  getSystemState
};
