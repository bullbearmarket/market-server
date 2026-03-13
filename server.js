const express = require("express");

const stockEngine = require("./engines/stockEngine");
const marketEngine = require("./engines/marketEngine");
const masterEngine = require("./engines/masterEngine");
const optionEngine = require("./engines/optionEngine");

const app = express();
const PORT = process.env.PORT || 10000;

console.log("Starting Engines...");

// START ENGINES
marketEngine.startMarketEngine();
masterEngine.startMasterEngine();
stockEngine.startStockEngine();
optionEngine.startOptionEngine(); // ⭐ OPTION ENGINE START (ATM + OPTION CHAIN)

// ROUTES

// Health check (Render + UptimeRobot)
app.get("/ping",(req,res)=>{
res.send("Server Alive");
});

// Market data
app.get("/market",(req,res)=>{
res.json(marketEngine.getMarket());
});

// Option chain
app.get("/option-chain/:symbol",(req,res)=>{
const symbol = req.params.symbol;
res.json(optionEngine.getOptionChain(symbol));
});

// Stocks
app.get("/stocks",(req,res)=>{
res.json(stockEngine.getStocks());
});

// START SERVER
app.listen(PORT,()=>{
console.log("Server running on port",PORT);
});
