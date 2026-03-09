const axios = require("axios");

let stocks = [];

async function fetchStocks(){

  try{

    const url =
    "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050";

    const response = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Accept":"application/json"
      }
    });

    const data = response.data.data;

    stocks = data.map((item)=>({
      symbol: item.symbol,
      price: item.lastPrice,
      change: item.change,
      percent: item.pChange
    }));

    console.log("NIFTY50 stocks updated");

  }catch(err){

    console.log("Stock Engine Error:",err.message);

  }

}

function startStockEngine(){

  fetchStocks();

  setInterval(fetchStocks,120000); // 2 minute

}

function getStocks(){

  return stocks;

}

module.exports = {
  startStockEngine,
  getStocks
};
