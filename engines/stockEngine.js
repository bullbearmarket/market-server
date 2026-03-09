const axios = require("axios");

let stocks = [];

const symbols = [
"RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY",
"ITC","HINDUNILVR","LT","SBIN","BHARTIARTL",
"KOTAKBANK","AXISBANK","ASIANPAINT","MARUTI",
"SUNPHARMA","ULTRACEMCO","TITAN","BAJFINANCE",
"BAJAJFINSV","NESTLEIND","POWERGRID","NTPC",
"ONGC","TATASTEEL","JSWSTEEL","COALINDIA",
"ADANIENT","ADANIPORTS","WIPRO","HCLTECH",
"TECHM","CIPLA","DRREDDY","EICHERMOT",
"HEROMOTOCO","BRITANNIA","APOLLOHOSP",
"DIVISLAB","GRASIM","INDUSINDBK",
"TATACONSUM","UPL","HDFCLIFE","SBILIFE",
"BAJAJ-AUTO","SHREECEM","BPCL","IOC",
"PIDILITIND","DABUR"
];

async function fetchStocks(){

  try{

    const url =
    "https://query2.finance.yahoo.com/v7/finance/quote?symbols=" +
    symbols.map(s => s + ".NS").join(",");

    const res = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0"
      }
    });

    const data = res.data.quoteResponse.result;

    stocks = data.map(item => ({
      symbol: item.symbol,
      price: item.regularMarketPrice,
      change: item.regularMarketChange,
      percent: item.regularMarketChangePercent
    }));

    console.log("NIFTY 50 stocks updated");

  }catch(err){

    console.log("Stock Engine Error:",err.message);

  }

}

function startStockEngine(){

  fetchStocks();

  setInterval(fetchStocks,120000); // 2 min

}

function getStocks(){

  return stocks;

}

module.exports = {
  startStockEngine,
  getStocks
};
