const axios = require("axios");

let market = {
  NIFTY: null,
  BANKNIFTY: null,
  SENSEX: null,
  time: null
};

/* FETCH MARKET DATA */

async function fetchMarketPrices(){

  try{

    const url =
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN";

    const res = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Accept":"application/json"
      }
    });

    const data = res.data.quoteResponse.result;

    market.NIFTY = data[0].regularMarketPrice;
    market.BANKNIFTY = data[1].regularMarketPrice;
    market.SENSEX = data[2].regularMarketPrice;

    market.time = Date.now();

    console.log("Market Updated:",market);

  }catch(err){

    console.log("Market Engine Error:",err.message);

  }

}

/* START ENGINE */

function startMarketEngine(){

  console.log("Market Engine Started");

  fetchMarketPrices();

  setInterval(fetchMarketPrices,10000);

}

/* GET MARKET */

function getMarket(){

  return market;

}

module.exports = {
  startMarketEngine,
  getMarket
};
