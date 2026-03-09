const axios = require("axios");

let market = {
  nifty:null,
  banknifty:null,
  sensex:null
};

async function fetchMarket(){

  try{

    const url =
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN";

    const res = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0"
      }
    });

    const data = res.data.quoteResponse.result;

    market.nifty = data[0].regularMarketPrice;
    market.banknifty = data[1].regularMarketPrice;
    market.sensex = data[2].regularMarketPrice;

    console.log("Market Updated:",market);

  }catch(err){

    console.log("Market Fetch Error:",err.message);

  }

}

function startMarketEngine(){

  fetchMarket();

  setInterval(fetchMarket,20000);

}

function getMarket(){
  return market;
}

module.exports = {
  startMarketEngine,
  getMarket
};
