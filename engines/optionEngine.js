const axios = require("axios");
const db = require("../firebase");

let optionCache = {
NIFTY: null,
BANKNIFTY: null
};

function calculateATM(price, step){
return Math.round(price / step) * step;
}

async function fetchOptionChain(symbol, expiry){

try{

let instrument;

if(symbol==="NIFTY"){
  instrument="NSE_INDEX|Nifty%2050";
}

if(symbol==="BANKNIFTY"){
  instrument="NSE_INDEX|Nifty%20Bank";
}

const url =
`https://api.upstox.com/v2/option/chain?instrument_key=${instrument}&expiry_date=${expiry}`;

const res = await axios.get(url,{
  headers:{
    Authorization:`Bearer ${process.env.UPSTOX_TOKEN}`,
    Accept:"application/json"
  }
});

const raw = res.data.data;

let chain = {};

raw.forEach(item=>{

  const strike = item.strike_price;

  if(!chain[strike]){
    chain[strike] = {};
  }

  if(item.option_type==="CE"){
    chain[strike].CE = item.last_price || 0;
  }

  if(item.option_type==="PE"){
    chain[strike].PE = item.last_price || 0;
  }

});

optionCache[symbol] = chain;

// 🔥 Firebase OptionChain update
await db.ref(`optionChain/${symbol}`).set(chain);

// 🔥 ATM calculation
const marketSnap = await db.ref("market").once("value");
const market = marketSnap.val();

if(market){

  if(symbol==="NIFTY"){

    const atm = calculateATM(market.nifty,50);
    await db.ref("ATM/NIFTY_ATM").set(atm);

  }

  if(symbol==="BANKNIFTY"){

    const atm = calculateATM(market.banknifty,100);
    await db.ref("ATM/BANKNIFTY_ATM").set(atm);

  }

}

console.log(symbol,"option chain updated");

}catch(err){

console.log(
  "Option Chain Error:",
  err.response?.data || err.message
);

}

}

function getOptionChain(symbol){
return optionCache[symbol];
}

module.exports = {
fetchOptionChain,
getOptionChain
};
