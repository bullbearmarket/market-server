const axios = require("axios");
const strikeEngine = require("./strikeEngine");
const optionEngine = require("./optionEngine");

let systemState = {
  NIFTY_ATM: null,
  BANKNIFTY_ATM: null
};

function detectATM(price, step){
  return Math.round(price / step) * step;
}

async function startMasterEngine(){

  setInterval(async () => {

    try{

      const res = await axios.get("https://market-server-xxim.onrender.com/market");
      const market = res.data;

      if(!market.nifty || !market.banknifty) return;

      const niftyATM = detectATM(market.nifty, 50);
      const bankniftyATM = detectATM(market.banknifty, 100);

      systemState.NIFTY_ATM = niftyATM;
      systemState.BANKNIFTY_ATM = bankniftyATM;

      strikeEngine.buildLadder("NIFTY", niftyATM);
      strikeEngine.buildLadder("BANKNIFTY", bankniftyATM);

      optionEngine.fetchOptionChain("NIFTY", niftyATM, "2026-03-13");
optionEngine.fetchOptionChain("BANKNIFTY", bankniftyATM, "2026-03-13");

      console.log("ATM Updated", systemState);

    }catch(err){

      console.log("Master Engine Error:", err.message);

    }

  }, 10000);

}

function getSystemState(){
  return systemState;
}

module.exports = {
  startMasterEngine,
  getSystemState
};
