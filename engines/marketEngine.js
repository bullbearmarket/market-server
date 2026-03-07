const axios = require("axios");

let market = {
  NIFTY: null,
  BANKNIFTY: null
};

async function fetchMarketPrices(){

  try{

    const res = await axios.get(
      "https://api.upstox.com/v2/market-quote/ltp",
      {
        params:{
          instrument_key:"NSE_INDEX|Nifty 50,NSE_INDEX|Nifty Bank"
        },
        headers:{
          Authorization:`Bearer ${process.env.UPSTOX_TOKEN}`,
          Accept:"application/json"
        }
      }
    );

    const data = res.data.data;

    if(!data){
      console.log("Upstox returned empty data");
      return;
    }

    const nifty = data["NSE_INDEX|Nifty 50"]?.last_price;
    const banknifty = data["NSE_INDEX|Nifty Bank"]?.last_price;

    if(!nifty || !banknifty){
      console.log("Upstox price not found");
      return;
    }

    market.NIFTY = nifty;
    market.BANKNIFTY = banknifty;

    console.log("Market Updated:", market);

  }catch(err){

    console.log("Upstox failed → Yahoo fallback");

    try{

      const res = await axios.get(
        "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK"
      );

      const q = res.data.quoteResponse.result;

      market.NIFTY = q[0].regularMarketPrice;
      market.BANKNIFTY = q[1].regularMarketPrice;

      console.log("Yahoo Market Updated:", market);

    }catch{

      console.log("Yahoo fallback failed");

    }

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
