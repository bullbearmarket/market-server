const axios = require("axios");
const strikeEngine = require("./strikeEngine");
const optionEngine = require("./optionEngine");
const expiryEngine = require("./expiryEngine");

let systemState = {
  NIFTY_ATM: null,
  BANKNIFTY_ATM: null
};

function detectATM(price, step){
  return Math.round(price / step) * step;
}

function formatExpiry(date){

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');

  return `${year}-${month}-${day}`;
}

async function startMasterEngine(){

  setInterval(async () => {

    try{

      const res = await axios.get("https://market-server-xxim.onrender.com/market");

      const market = res.data;

      if(!market.nifty || !market.banknifty) return;

      const niftyATM = detectATM(market.nifty,50);
      const bankATM = detectATM(market.banknifty,100);

      systemState.NIFTY_ATM = niftyATM;
      systemState.BANKNIFTY_ATM = bankATM;

      strikeEngine.buildLadder("NIFTY", niftyATM);
      strikeEngine.buildLadder("BANKNIFTY", bankATM);

      const expiries = expiryEngine.getExpiries();

      const niftyExpiry = formatExpiry(expiries.NIFTY[0]);
      const bankExpiry = formatExpiry(expiries.BANKNIFTY[0]);

      optionEngine.fetchOptionChain("NIFTY", niftyExpiry);
      optionEngine.fetchOptionChain("BANKNIFTY", bankExpiry);

      console.log("ATM Updated",systemState);

    }catch(err){

      console.log("Master Engine Error:",err.message);

    }

  },10000);

}

function getSystemState(){
  return systemState;
}

module.exports = {
  startMasterEngine,
  getSystemState
};
