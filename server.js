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

/* ---------------- MARKET CACHE ---------------- */

let marketCache = {
  nifty: null,
  banknifty: null,
  sensex: null,
  source: "upstox"
};

/* ---------------- FETCH MARKET ---------------- */

async function fetchMarket(){

  try{

    const res = await axios.get(
      "https://www.nseindia.com/api/allIndices",
      {
        headers:{
          "User-Agent":"Mozilla/5.0",
          "Accept":"application/json",
          "Accept-Language":"en-US,en;q=0.9"
        }
      }
    );

    const d = res.data.data;
console.log("UPSTOX DATA:", res.data);
const nifty =
d["NSE_INDEX|NIFTY 50"]?.last_price ||
d["NSE_INDEX|Nifty 50"]?.last_price ||
null;

const banknifty =
d["NSE_INDEX|NIFTY BANK"]?.last_price ||
d["NSE_INDEX|Nifty Bank"]?.last_price ||
null;

const sensex =
d["BSE_INDEX|SENSEX"]?.last_price ||
null;

    marketCache = {
      nifty,
      banknifty,
      sensex,
      source:"nse"
    };

    console.log("Market Updated:",marketCache);

  }catch(err){

    console.log("Market Fetch Error:",err.message);

  }

}
    );

    const d = res.data.data;

    const nifty =
      d["NSE_INDEX|NIFTY 50"]?.last_price ||
      d["NSE_INDEX|Nifty 50"]?.last_price ||
      null;

    const banknifty =
      d["NSE_INDEX|NIFTY BANK"]?.last_price ||
      d["NSE_INDEX|Nifty Bank"]?.last_price ||
      null;

    marketCache = {
      nifty,
      banknifty,
      sensex:null,
      source:"nse"
    };

    console.log("Market Updated:", marketCache);

  }catch(err){

    console.log("Market Fetch Error:", err.message);

  }

}

/* ---------------- ROUTES ---------------- */

app.get("/market",(req,res)=>{
  res.json(marketCache);
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

/* ---------------- START ENGINES ---------------- */

async function startEngine(){

  console.log("Starting Engines...");

  await instrumentEngine.downloadInstrumentFile();

  const instruments = await instrumentEngine.parseInstrumentFile();

  expiryEngine.detectExpiries(instruments);

  masterEngine.startMasterEngine();

  console.log("Market Engine Started");

  await fetchMarket();

  /* MARKET REFRESH 5 MINUTES */

  setInterval(fetchMarket,300000);

  console.log("All Engines Started");

}

startEngine();

/* ---------------- SERVER ---------------- */

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});



