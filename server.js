const express = require("express");
const axios = require("axios");

const instrumentEngine = require("./engines/instrumentEngine");
const expiryEngine = require("./engines/expiryEngine");
const masterEngine = require("./engines/masterEngine");

const optionEngine = require("./engines/optionEngine");
const analyzerEngine = require("./engines/analyzerEngine");
const signalEngine = require("./engines/signalEngine");
const smartMoneyEngine = require("./engines/smartMoneyEngine");
const pressureEngine = require("./engines/pressureEngine");
const tradeEngine = require("./engines/tradeEngine");

const app = express();
const PORT = process.env.PORT || 10000;

const ACCESS_TOKEN = process.env.UPSTOX_TOKEN;

/* ---------- CACHE ---------- */

let marketCache = null;

/* ---------- MARKET DATA ---------- */

async function fetchMarket(){

  try{

    const res = await axios.get(
      "https://api.upstox.com/v2/market-quote/ltp",
      {
        params:{
          instrument_key:"NSE_INDEX|Nifty 50,NSE_INDEX|Nifty Bank"
        },
        headers:{
          Authorization:`Bearer ${ACCESS_TOKEN}`,
          Accept:"application/json"
        }
      }
    );

    const d = res.data.data;

    const nifty = d["NSE_INDEX|Nifty 50"].last_price;
    const banknifty = d["NSE_INDEX|Nifty Bank"].last_price;

    const sensexRes = await axios.get(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EBSESN"
    );

    const sensex =
      sensexRes.data.quoteResponse.result[0].regularMarketPrice;

    marketCache = {
      nifty,
      banknifty,
      sensex,
      source:"upstox"
    };

    console.log("Market updated", marketCache);

  }catch(e){

    console.log("Upstox failed → Yahoo fallback");

    try{

      const res = await axios.get(
        "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK"
      );

      const q = res.data.quoteResponse.result;

      marketCache = {
        nifty:q[0].regularMarketPrice,
        banknifty:q[1].regularMarketPrice,
        source:"yahoo"
      };

    }catch{
      console.log("Yahoo fallback failed");
    }

  }

}

/* ---------- ROUTES ---------- */

app.get("/market",(req,res)=>{
  res.json(marketEngine.getMarket());
});

app.get("/option-chain/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(optionEngine.getOptionChain(symbol));
});

app.get("/analyze/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(analyzerEngine.analyze(symbol));
});

app.get("/signal/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(signalEngine.generateSignal(symbol));
});

app.get("/smart-money/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(smartMoneyEngine.detectSmartMoney(symbol));
});

app.get("/market-pressure/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(pressureEngine.calculatePressure(symbol));
});

app.get("/ai-trade/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(tradeEngine.generateTrade(symbol));
});

/* ---------- START ENGINES ---------- */

async function startEngine(){

  await instrumentEngine.downloadInstrumentFile();

  const instruments = await instrumentEngine.parseInstrumentFile();

  expiryEngine.detectExpiries(instruments);

  masterEngine.startMasterEngine();

  /* market start */

  await fetchMarket();

  setInterval(fetchMarket,10000);

}

startEngine();

/* ---------- SERVER ---------- */

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});

