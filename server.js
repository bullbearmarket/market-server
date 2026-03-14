const express = require("express");

const stockEngine = require("./engines/stockEngine");
const marketEngine = require("./engines/marketEngine");
const masterEngine = require("./engines/masterEngine");
const optionEngine = require("./engines/optionEngine");

// NEWS SYSTEM
const { runNewsAPI, runFinnhub } = require("./services/newsSave");
const admin = require("./firebase");

const app = express();
const PORT = process.env.PORT || 10000;

console.log("Starting Engines...");

// START ENGINES
marketEngine.startMarketEngine();
masterEngine.startMasterEngine();
stockEngine.startStockEngine();
optionEngine.startOptionEngine(); // ⭐ OPTION ENGINE START (ATM + OPTION CHAIN)



// ================= NEWS SYSTEM =================


// Finnhub → every 5 minutes
setInterval(async () => {

console.log("Fetching Finnhub News");

await runFinnhub();

},300000);


// NewsAPI → every 15 minutes
setInterval(async () => {

console.log("Fetching NewsAPI News");

await runNewsAPI();

},900000);


// AUTO DELETE OLD NEWS (24 HOURS)

setInterval(async () => {

try{

const db = admin.database();
const ref = db.ref("market_news");

const snapshot = await ref.once("value");

const now = Date.now();

snapshot.forEach(s => {

const data = s.val();

if(now - data.time > 86400000){

s.ref.remove();

}

});

console.log("Old news deleted");

}catch(err){

console.log("News cleanup error");

}

},3600000);


// ================= ROUTES =================


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
