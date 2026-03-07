const axios = require("axios");

let optionCache = {};

async function fetchOptionChain(symbol, atm){

  try{

    const url = `https://api.upstox.com/v2/option/chain?symbol=${symbol}&strike=${atm}`;

    const response = await axios.get(url,{
      headers:{
        Authorization: `Bearer ${process.env.UPSTOX_TOKEN}`
      }
    });

    optionCache[symbol] = response.data;

    console.log(symbol + " option chain updated");

  }catch(err){

    console.log("Option Chain Error", err.message);

  }

}

function getOptionChain(symbol){
  return optionCache[symbol];
}

module.exports = {
  fetchOptionChain,
  getOptionChain
};
