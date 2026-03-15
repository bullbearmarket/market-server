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

// ================= START ENGINES =================

marketEngine.startMarketEngine();
masterEngine.startMasterEngine();
stockEngine.startStockEngine();
optionEngine.startOptionEngine();
runFinnhub();
runNewsAPI();


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
const ref = db.ref("news");

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



// ================= COMMUNITY CHAT CLEANER =================


// Delete old community messages
setInterval(async () => {

try{

console.log("Cleaning community chat...");

const db = admin.database();

const ref = db.ref("community/messages");

const snapshot = await ref.once("value");

const now = Date.now();

snapshot.forEach(s => {

const msg = s.val();

if(!msg.timestamp) return;

let limit = 4 * 60 * 60 * 1000; // 4 HOURS

// OWNER MESSAGE → 48 HOURS
if(msg.isOwner === true){
limit = 48 * 60 * 60 * 1000;
}

if(now - msg.timestamp > limit){

s.ref.remove();

}

});

console.log("Community cleanup done");

}catch(err){

console.log("Community cleanup error");

}

},600000); // RUN EVERY 10 MINUTES



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



// ================= START SERVER =================

app.listen(PORT,()=>{
console.log("Server running on port",PORT);
});
