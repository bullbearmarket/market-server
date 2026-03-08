const express = require("express");

/* ---------- ENGINES ---------- */

const instrumentEngine = require("./engines/instrumentEngine");
const expiryEngine = require("./engines/expiryEngine");
const marketEngine = require("./engines/marketEngine");
const masterEngine = require("./engines/masterEngine");

const optionEngine = require("./engines/optionEngine");
const analyzerEngine = require("./engines/analyzerEngine");
const signalEngine = require("./engines/signalEngine");
const smartMoneyEngine = require("./engines/smartMoneyEngine");
const pressureEngine = require("./engines/pressureEngine");
const tradeEngine = require("./engines/tradeEngine");

/* ---------- APP ---------- */

const app = express();
const PORT = process.env.PORT || 10000;

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

  console.log("Starting Engines...");

  await instrumentEngine.downloadInstrumentFile();

  const instruments = await instrumentEngine.parseInstrumentFile();

  expiryEngine.detectExpiries(instruments);

  marketEngine.startMarketEngine();

  masterEngine.startMasterEngine();

  console.log("All Engines Started");

}

startEngine();

/* ---------- SERVER ---------- */

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});
