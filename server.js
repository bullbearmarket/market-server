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

    const res = await api.get(
      "https://api.upstox.com/v2/market-quote/option-chain?instrument_key=NSE_INDEX|Nifty 50"
    );

    const data = res.data.data;

    console.log("Option Chain Received:", data.length);

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
