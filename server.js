const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== APIs ===== */

const OPTION_CHAIN_API =
  "https://lingering-math-11eb.moneymaker-earnmoney.workers.dev";

const YAHOO_API =
  "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN";

/* ===== MARKET CACHE ===== */

let market = {
  nifty: 0,
  banknifty: 0,
  sensex: 0,
  optionChain: {},
  atm: 0
};

/* ===== MARKET DATA (Yahoo) ===== */

async function fetchMarket() {
  try {
    const res = await axios.get(YAHOO_API);

    const data = res.data.quoteResponse.result;

    market.nifty = data[0].regularMarketPrice;
    market.banknifty = data[1].regularMarketPrice;
    market.sensex = data[2].regularMarketPrice;

    console.log("Market Updated:", market);

  } catch (err) {
    console.log("Market Error:", err.message);
  }
}

/* ===== OPTION CHAIN ===== */

async function fetchOptionChain() {
  try {

    const res = await axios.get(OPTION_CHAIN_API);

    const records = res.data.records.data;
    const spot = res.data.records.underlyingValue;

    const atm = Math.round(spot / 50) * 50;

    let strikes = {};

    records.forEach(item => {

      const strike = item.strikePrice;

      if (Math.abs(strike - atm) <= 500) {

        strikes[strike] = {

          CE_LTP: item.CE?.lastPrice || 0,
          PE_LTP: item.PE?.lastPrice || 0,

          CE_OI: item.CE?.openInterest || 0,
          PE_OI: item.PE?.openInterest || 0,

          CE_CHANGE_OI: item.CE?.changeinOpenInterest || 0,
          PE_CHANGE_OI: item.PE?.changeinOpenInterest || 0
        };

      }

    });

    market.optionChain = strikes;
    market.atm = atm;

    console.log("Option Chain Updated | ATM:", atm);

  } catch (err) {

    console.log("Option Chain Error:", err.message);

  }
}

/* ===== API ===== */

app.get("/market", (req, res) => {
  res.json(market);
});

app.get("/option-chain", (req, res) => {
  res.json({
    atm: market.atm,
    strikes: market.optionChain
  });
});

/* ===== ROOT ===== */

app.get("/", (req, res) => {
  res.send("BullBearMarket Backend Running");
});

/* ===== SERVER START ===== */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

/* ===== AUTO REFRESH ===== */

setInterval(fetchMarket, 20000);
setInterval(fetchOptionChain, 20000);

/* FIRST LOAD */

fetchMarket();
fetchOptionChain();
