const express = require("express");
const axios = require("axios");
const instrumentEngine = require("./engines/instrumentEngine");

const app = express();
const PORT = process.env.PORT || 10000;

const ACCESS_TOKEN = process.env.UPSTOX_TOKEN;

/* ---------- CACHE ---------- */

let marketCache = null;
let optionCache = null;

/* ---------- NEXT THURSDAY ---------- */

function getNextThursday() {
  const now = new Date();
  const day = now.getDay();
  const diff = (4 + 7 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  return next.toISOString().split("T")[0];
}

/* ---------- MARKET DATA ---------- */

async function fetchMarket() {
  try {
    const res = await axios.get(
      "https://api.upstox.com/v2/market-quote/ltp",
      {
        params: {
          instrument_key:
            "NSE_INDEX|Nifty 50,NSE_INDEX|Nifty Bank"
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          Accept: "application/json"
        }
      }
    );

    const d = res.data.data;

    const nifty = d["NSE_INDEX|Nifty 50"].last_price;
    const banknifty = d["NSE_INDEX|Nifty Bank"].last_price;

    const sensexRes = await axios.get(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EBSESN"
    );

    const sensex =
      sensexRes.data.quoteResponse.result[0].regularMarketPrice;

    marketCache = {
      nifty,
      banknifty,
      sensex,
      source: "upstox"
    };

    console.log("Market updated");

  } catch (e) {

    console.log("Upstox failed → Yahoo fallback");

    try {

      const res = await axios.get(
        "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK"
      );

      const q = res.data.quoteResponse.result;

      marketCache = {
        nifty: q[0].regularMarketPrice,
        banknifty: q[1].regularMarketPrice,
        source: "yahoo"
      };

    } catch {
      console.log("Yahoo fallback failed");
    }
  }
}

/* ---------- OPTION CHAIN ---------- */

async function fetchOption() {

  try {

    const expiry = getNextThursday();

    const url =
      `https://api.upstox.com/v2/option/chain?instrument_key=NSE_INDEX%7CNIFTY&expiry_date=${expiry}`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: "application/json"
      }
    });

    optionCache = res.data.data;

    console.log("Option chain updated");

  } catch (e) {

    console.log("Option Chain Error:", e.message);

  }

}

/* ---------- REFRESH ---------- */

setInterval(fetchMarket, 10000);
setInterval(fetchOption, 10000);

/* ---------- ROUTES ---------- */

app.get("/market", (req, res) => {
  res.json(marketCache);
});

app.get("/option-chain", (req, res) => {
  res.json(optionCache);
});

/* ---------- SERVER ---------- */

async function startEngine(){

await instrumentEngine.downloadInstrumentFile();
await instrumentEngine.parseInstrumentFile();

}

startEngine();

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

