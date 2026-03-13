const express = require("express");

const stockEngine = require("./engines/stockEngine");
const marketEngine = require("./engines/marketEngine");
const masterEngine = require("./engines/masterEngine");
const optionEngine = require("./engines/optionEngine");

const app = express();
const PORT = process.env.PORT || 10000;

console.log("Starting Engines...");

// start engines
marketEngine.startMarketEngine();
masterEngine.startMasterEngine();
stockEngine.startStockEngine();

// ROUTES

app.get("/market",(req,res)=>{
  res.json(marketEngine.getMarket());
});

app.get("/option-chain/:symbol",(req,res)=>{
  const symbol = req.params.symbol;
  res.json(optionEngine.getOptionChain(symbol));
});

app.get("/stocks",(req,res)=>{
  res.json(stockEngine.getStocks());
});

app.listen(PORT,()=>{
  console.log("Server running on port",PORT);
});

app.get("/ping",(req,res)=>{
  res.send("Server Alive");
});
