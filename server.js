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

/* ---------- MARKET CACHE ---------- */

let marketCache = {
  nifty:null,
  banknifty:null,
  sensex:null,
  source:"yahoo"
};

/* ---------- FETCH MARKET (YAHOO ONLY) ---------- */

async function fetchMarket(){

  try{

    const res = await axios.get(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN"
    );

    const q = res.data.quoteResponse.result;

    const nifty = q.find(i=>i.symbol==="^NSEI")?.regularMarketPrice;
    const banknifty = q.find(i=>i.symbol==="^NSEBANK")?.regularMarketPrice;
    const sensex = q.find(i=>i.symbol==="^BSESN")?.regularMarketPrice;

    marketCache = {
      nifty,
      banknifty,
      sensex,
      source:"yahoo"
    };

    console.log("Market Updated:",marketCache);

  }catch(err){

    console.log("Yahoo Market Error:",err.message);

  }

}

/* ---------- ROUTES ---------- */

app.get("/",(req,res)=>{
  res.send("BullBear AI Backend Running");
});

app.get("/market",(req,res)=>{
  res.json(marketCache);
});

app.get("/option-chain/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = optionEngine.getOptionChain(symbol);

  if(!data){
    return res.json({error:"Option data not ready"});
  }

  res.json(data);

});

app.get("/analyze/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = analyzerEngine.analyze(symbol);

  if(!data){
    return res.json({error:"Analyzer not ready"});
  }

  res.json(data);

});

app.get("/signal/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = signalEngine.generateSignal(symbol);

  if(!data){
    return res.json({error:"Signal not ready"});
  }

  res.json(data);

});

app.get("/smart-money/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = smartMoneyEngine.detectSmartMoney(symbol);

  if(!data){
    return res.json({error:"Smart money not ready"});
  }

  res.json(data);

});

app.get("/market-pressure/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = pressureEngine.calculatePressure(symbol);

  if(!data){
    return res.json({error:"Pressure data not ready"});
  }

  res.json(data);

});

app.get("/ai-trade/:symbol",(req,res)=>{

  const symbol = req.params.symbol;

  const data = tradeEngine.generateTrade(symbol);

  if(!data){
    return res.json({error:"Trade engine not ready"});
  }

  res.json(data);

});

/* ---------- START ENGINES ---------- */

async function startEngine(){

  console.log("Starting Engines...");

  await instrumentEngine.downloadInstrumentFile();

  const instruments = await instrumentEngine.parseInstrumentFile();

  expiryEngine.detectExpiries(instruments);

  masterEngine.startMasterEngine();

  console.log("Market Engine Started");

  await fetchMarket();

  setInterval(fetchMarket,10000);

  console.log("All Engines Started");

}

startEngine();

/* ---------- SERVER ---------- */

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});
