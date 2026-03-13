const axios = require("axios");
const db = require("../firebase");

let stocks = [];

async function fetchStocks(){

  try{

    const url =
    "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050";

    const response = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept":"application/json",
        "Accept-Language":"en-US,en;q=0.9",
        "Referer":"https://www.nseindia.com/",
        "Connection":"keep-alive"
      }
    });

    const data = response.data.data;

    stocks = data.map((item)=>({
      symbol: item.symbol,
      price: item.lastPrice,
      change: item.change,
      percent: item.pChange
    }));

    // 🔥 Firebase update
    await db.ref("stocks").set(stocks)
    .then(()=>{
      console.log("Firebase stocks updated");
    })
    .catch((err)=>{
      console.log("Firebase stock write error:",err);
    });

    console.log("NIFTY50 stocks updated");

  }catch(err){

    console.log("Stock Engine Error:", err.message);

  }

}

function startStockEngine(){

  console.log("Stock Engine Started");

  fetchStocks();

  setInterval(fetchStocks,120000);

}

function getStocks(){
  return stocks;
}

module.exports = {
  startStockEngine,
  getStocks
};
