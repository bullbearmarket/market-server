const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

const api = axios.create({
  timeout: 15000
});

/* MARKET DATA (Yahoo) */

async function fetchMarket() {
  try {

    const res = await api.get(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI"
    );

    const price = res.data.chart.result[0].meta.regularMarketPrice;

    console.log("NIFTY:", price);

  } catch (err) {

    console.log("Market Error:", err.message);

  }
}


/* OPTION CHAIN (UPSTOX) */

async function fetchOptionChain() {

  try {

const res = await axios.get(
"https://lingering-math-11eb.moneymaker-earnmoney.workers.dev"
);

   const data = res.data.data;

const spot = data.spot;

const atm = Math.round(spot / 50) * 50;

let strikes = {};

data.strikes.forEach(item => {

  const strike = item.strike;

  if (Math.abs(strike - atm) <= 500) {

    strikes[strike] = {
      CE: item.ce_ltp,
      PE: item.pe_ltp,
      CE_OI: item.ce_oi,
      PE_OI: item.pe_oi
    };

  }

});

await db.ref("optionchain/nifty").set({
  spot: spot,
  atm: atm,
  strikes: strikes,
  time: Date.now()
});

console.log("Option Chain Updated | ATM:", atm);

  } catch (err) {

    console.log("Option Chain Error:", err.message);

  }

}


/* INTERVAL */

setInterval(fetchMarket, 20000);
setInterval(fetchOptionChain, 60000);


/* SERVER */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});



