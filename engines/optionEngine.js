const axios = require("axios");

let optionData = null;

async function fetchOptionChain(symbol, expiry){

  try{

    const url =
      "https://api.upstox.com/v2/option/chain?symbol=" +
      symbol +
      "&expiry_date=" +
      expiry;

    const res = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + process.env.UPSTOX_TOKEN
      }
    });

    optionData = res.data.data;

    console.log(symbol + " option chain updated");

  }catch(err){

    console.log("Option Engine Error");

  }

}

function getOptionChain(){

  return optionData;

}

module.exports = {
  fetchOptionChain,
  getOptionChain
};
