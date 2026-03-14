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
market_data:{ask_price:0}
},
put_options:{
market_data:{ask_price:0}
}
};
}

if(item.option_type==="CE"){
strikes[strike].call_options.market_data.ask_price =
item.last_price || 0;
}

if(item.option_type==="PE"){
strikes[strike].put_options.market_data.ask_price =
item.last_price || 0;
}

});

let chain = {};

Object.keys(strikes)
.sort((a,b)=>a-b)
.forEach(strike=>{

chain[index] = {

call_options:{
market_data:{
ask_price:
strikes[strike].call_options.market_data.ask_price
}
},

put_options:{
strike_price:parseInt(strike),

market_data:{
ask_price:
strikes[strike].put_options.market_data.ask_price
}
}

};

index++;

});

optionCache[symbol] = chain;

// FIREBASE UPDATE
await db.ref(`optionChain/${symbol}/data`).set(chain);


// ATM CALCULATION
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


// 🔥 OPTION ENGINE START
function startOptionEngine(){

console.log("Option Engine Started");

setInterval(()=>{

// weekly expiry example
const expiry = "2026-03-30";

fetchOptionChain("NIFTY",expiry);
fetchOptionChain("BANKNIFTY",expiry);

},15000); // refresh every 15 sec

}


function getOptionChain(symbol){
return optionCache[symbol];
}


module.exports = {
fetchOptionChain,
getOptionChain,
startOptionEngine
};
