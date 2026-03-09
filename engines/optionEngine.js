const axios = require("axios");

let optionCache = {};

async function fetchOptionChain(symbol, expiry){

  try{

    let instrument;

    if(symbol === "NIFTY"){
      instrument = "NSE_INDEX|Nifty%2050";
    }

    if(symbol === "BANKNIFTY"){
      instrument = "NSE_INDEX|Nifty%20Bank";
    }

    const url =
    `https://api.upstox.com/v2/option/chain?instrument_key=${instrument}&expiry_date=${expiry}`;

    const response = await axios.get(url,{
      headers:{
        Authorization:`Bearer ${process.env.UPSTOX_TOKEN}`,
        Accept:"application/json"
      }
    });

    optionCache[symbol] = response.data;

    console.log(symbol + " option chain updated");

  }catch(err){

    console.log("Option Chain Error:", err.response?.data || err.message);

  }

}

function getOptionChain(symbol){
  return optionCache[symbol];
}

module.exports = {
  fetchOptionChain,
  getOptionChain
};
