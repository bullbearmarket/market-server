const marketEngine = require("./marketEngine");
const strikeEngine = require("./strikeEngine");
const optionEngine = require("./optionEngine");

let systemState = {
  NIFTY_ATM:null,
  BANKNIFTY_ATM:null
};

function detectATM(price,step){
  return Math.round(price/step)*step;
}

async function startMasterEngine(){

  setInterval(async ()=>{

    try{

      const market = marketEngine.getMarket();

      if(!market.nifty || !market.banknifty) return;

      const niftyATM = detectATM(market.nifty,50);
      const bankATM = detectATM(market.banknifty,100);

      systemState.NIFTY_ATM = niftyATM;
      systemState.BANKNIFTY_ATM = bankATM;

      strikeEngine.buildLadder("NIFTY",niftyATM);
      strikeEngine.buildLadder("BANKNIFTY",bankATM);

      // expiry (manual stable)
      const niftyExpiry = "2026-03-10";
      const bankExpiry = "2026-03-30";

      await optionEngine.fetchOptionChain("NIFTY",niftyExpiry);
      await optionEngine.fetchOptionChain("BANKNIFTY",bankExpiry);

      console.log("ATM Updated",systemState);

    }catch(err){

      console.log("Master Engine Error:",err.message);

    }

  },30000);

}

module.exports = {
  startMasterEngine
};
