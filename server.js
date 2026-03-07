const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===========================
   UPSTOX API
=========================== */

const API_KEY = "e43e54bc-3227-407c-a01c-fb558b4813cd";
const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIxNTQ3NDAiLCJqdGkiOiI2OWFjMTRkMWZlM2ExODdjOTc0OTBkNzAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc3Mjg4NTIwMSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzcyOTIwODAwfQ.fi4JD-IaSZTiy2cIgAaVMpgqjDKigigFQ_d920_d7rU";

/* ===========================
   CACHE
=========================== */

let marketCache = null;
let optionCache = null;

let lastMarketUpdate = 0;
let lastOptionUpdate = 0;

/* ===========================
   FETCH MARKET DATA
=========================== */

async function fetchMarketData() {

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

    const data = res.data.data;

    const nifty = data["NSE_INDEX|Nifty 50"].last_price;
    const banknifty = data["NSE_INDEX|Nifty Bank"].last_price;

    /* Sensex Yahoo backup */

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

    lastMarketUpdate = Date.now();

    console.log("Market Updated");

  } catch (err) {

    console.log("Upstox failed → Yahoo fallback");

    try {

      const res = await axios.get(
        "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN"
      );

      const q = res.data.quoteResponse.result;

      marketCache = {
        nifty: q[0].regularMarketPrice,
        banknifty: q[1].regularMarketPrice,
        sensex: q[2].regularMarketPrice,
        source: "yahoo"
      };

      lastMarketUpdate = Date.now();

    } catch (error) {

      console.log("Yahoo also failed");

    }

  }

}

/* ===========================
   FETCH OPTION CHAIN
=========================== */

async function fetchOptionChain() {

  try {

    const res = await axios.get(
      "https://api.upstox.com/v2/option/chain",
      {
        params: {
          instrument_key: "NSE_INDEX|Nifty 50"
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          Accept: "application/json"
        }
      }
    );

    const list = res.data.data;

    const strikes = [];

    let atm = null;

    if (marketCache) {

      const price = marketCache.nifty;

      let closest = Infinity;

      list.forEach((row) => {

        const diff = Math.abs(row.strike_price - price);

        if (diff < closest) {
          closest = diff;
          atm = row.strike_price;
        }

        strikes.push({
          strike: row.strike_price,
          ce: row.call_options?.market_data?.ltp || 0,
          pe: row.put_options?.market_data?.ltp || 0,
          ce_oi: row.call_options?.market_data?.oi || 0,
          pe_oi: row.put_options?.market_data?.oi || 0
        });

      });

    }

    optionCache = {
      atm,
      strikes
    };

    lastOptionUpdate = Date.now();

    console.log("Option Chain Updated");

  } catch (err) {

    console.log("Option Chain Error:", err.message);

  }

}

/* ===========================
   AUTO REFRESH
=========================== */

setInterval(fetchMarketData, 10000);
setInterval(fetchOptionChain, 10000);

/* ===========================
   API ROUTES
=========================== */

app.get("/market", async (req, res) => {

  if (!marketCache || Date.now() - lastMarketUpdate > 10000) {
    await fetchMarketData();
  }

  res.json(marketCache);

});

app.get("/option-chain", async (req, res) => {

  if (!optionCache || Date.now() - lastOptionUpdate > 10000) {
    await fetchOptionChain();
  }

  res.json(optionCache);

});

/* ===========================
   SERVER
=========================== */

app.listen(PORT, () => {

  console.log("BullBear Market Server Running on port", PORT);

});
