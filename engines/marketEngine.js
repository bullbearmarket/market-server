const axios = require("axios");

let market = {
  NIFTY: null,
  BANKNIFTY: null
};

async function fetchMarketPrices(){

  try{

    const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK";

    const res = await axios.get(url);

    const data = res.data.quoteResponse.result;

    market.NIFTY = data[0].regularMarketPrice;
    market.BANKNIFTY = data[1].regularMarketPrice;

    console.log("Market Updated", market);

  }catch(err){

    console.log("Market Engine Error");

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
