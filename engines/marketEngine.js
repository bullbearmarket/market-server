const axios = require("axios");

let market = {
  NIFTY: null,
  BANKNIFTY: null
};

async function fetchMarketPrices(){

  try{

    const url = "https://api.upstox.com/v2/market-quote/quotes?instrument_key=NSE_INDEX|Nifty%2050,NSE_INDEX|Nifty%20Bank";

    const res = await axios.get(url,{
      headers:{
        Authorization: `Bearer ${process.env.UPSTOX_TOKEN}`,
        Accept: "application/json"
      }
    });

    const data = res.data.data;

    if(data){

      market.NIFTY = data["NSE_INDEX|Nifty 50"].last_price;
      market.BANKNIFTY = data["NSE_INDEX|Nifty Bank"].last_price;

    }

    console.log("Market Updated:", market);

  }catch(err){

    console.log("Market Engine Error:", err.response?.data || err.message);

  }

}

function startMarketEngine(){

  fetchMarketPrices();

  setInterval(fetchMarketPrices, 10000);

}

function getMarket(){

  return market;

}

module.exports = {
  startMarketEngine,
  getMarket
};
