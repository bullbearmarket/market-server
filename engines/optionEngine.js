const axios = require("axios");
const db = require("../firebase");

let optionCache = {
NIFTY: null,
BANKNIFTY: null
};

function calculateATM(price, step){
return Math.round(price / step) * step;
}

async function fetchOptionChain(symbol, expiry){

try{

let instrument;

if(symbol==="NIFTY"){
instrument="NSE_INDEX|Nifty%2050";
}

if(symbol==="BANKNIFTY"){
instrument="NSE_INDEX|Nifty%20Bank";
}

const url =
`https://api.upstox.com/v2/option/chain?instrument_key=${instrument}&expiry_date=${expiry}`;

const res = await axios.get(url,{
headers:{
Authorization:`Bearer ${process.env.UPSTOX_TOKEN}`,
Accept:"application/json"
}
});

const raw = res.data.data;

let strikes = {};
let index = 0;

raw.forEach(item=>{

const strike = item.strike_price;

if(!strikes[strike]){
strikes[strike] = {
strike_price: strike,
call_options:{
market_data:{ltp:0}
},
put_options:{
market_data:{ltp:0}
}
};
}

// 🔥 Premium Field (LTP first)
const price =
item.ltp ||
item.last_traded_price ||
item.bid_price ||
item.ask_price ||
item.last_price ||
0;

if(item.option_type==="CE"){
strikes[strike].call_options.market_data.ltp = price;
}

if(item.option_type==="PE"){
strikes[strike].put_options.market_data.ltp = price;
}

});

let chain = {};

Object.keys(strikes)
.sort((a,b)=>a-b)
.forEach(strike=>{

chain[index] = {

call_options:{
market_data:{
ltp:
strikes[strike].call_options.market_data.ltp
}
},

put_options:{
strike_price:parseInt(strike),

market_data:{
ltp:
strikes[strike].put_options.market_data.ltp
}
}

};

index++;

});

optionCache[symbol] = chain;

// Firebase update
await db.ref(`optionChain/${symbol}/data`).set(chain);

// ATM Calculation
const marketSnap = await db.ref("market").once("value");
const market = marketSnap.val();

if(market){

if(symbol==="NIFTY"){
const atm = calculateATM(market.nifty,50);
await db.ref("ATM/NIFTY_ATM").set(atm);
}

if(symbol==="BANKNIFTY"){
const atm = calculateATM(market.banknifty,100);
await db.ref("ATM/BANKNIFTY_ATM").set(atm);
}

}

console.log(symbol,"option chain updated");

}catch(err){

console.log(
"Option Chain Error:",
err.response?.data || err.message
);

}

}

// ENGINE START
function startOptionEngine(){

console.log("Option Engine Started");

setInterval(()=>{

const expiry = "2026-03-30";

fetchOptionChain("NIFTY",expiry);
fetchOptionChain("BANKNIFTY",expiry);

},25000); // 25 sec refresh

}

function getOptionChain(symbol){
return optionCache[symbol];
}

module.exports = {
fetchOptionChain,
getOptionChain,
startOptionEngine
};
