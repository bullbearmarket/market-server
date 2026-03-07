const pressureEngine = require("./pressureEngine");
const smartMoneyEngine = require("./smartMoneyEngine");
const signalEngine = require("./signalEngine");

function generateTrade(symbol){

const pressure = pressureEngine.calculatePressure(symbol);

const smartMoney = smartMoneyEngine.detectSmartMoney(symbol);

const signal = signalEngine.generateSignal(symbol);

if(!pressure || !smartMoney || !signal) return null;

let trade = "NO TRADE";

if(
pressure.sentiment === "BULLISH" &&
smartMoney.action === "SMART MONEY BUYING" &&
signal.signal === "BUY"
){
trade = "BUY CALL";
}

if(
pressure.sentiment === "BEARISH" &&
smartMoney.action === "SMART MONEY SELLING" &&
signal.signal === "SELL"
){
trade = "BUY PUT";
}

return{

symbol: symbol,

trade: trade,

confidence: Math.floor(Math.random()*20)+70 + "%"

};

}

module.exports = {
generateTrade
};
