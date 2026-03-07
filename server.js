const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

/* MARKET DATA (Yahoo Finance) */

async function fetchMarket() {
  try {

    const res = await axios.get(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI,%5ENSEBANK,%5EBSESN"
    );

    const data = res.data.quoteResponse.result;

    return {
      nifty: data[0].regularMarketPrice,
      banknifty: data[1].regularMarketPrice,
      sensex: data[2].regularMarketPrice,
      time: Date.now()
    };

  } catch (err) {

    console.log("Market Error:", err.message);

    return {
      error: "market fetch failed"
    };

  }
}

/* OPTION CHAIN (UPSTOX) */

async function fetchOptionChain() {

  try {

    const res = await axios.get(
      "https://api.upstox.com/v2/option/chain?instrument_key=NSE_INDEX|Nifty%2050",
      {
        headers: {
          Authorization: "Bearer YOUR_UPSTOX_TOKEN"
        }
      }
    );

    return res.data;

  } catch (err) {

    console.log("Option Chain Error:", err.message);

    return {
      error: "option chain failed"
    };

  }
}

/* API ROUTES */

app.get("/market", async (req, res) => {

  const data = await fetchMarket();

  res.json(data);

});

app.get("/option-chain", async (req, res) => {

  const data = await fetchOptionChain();

  res.json(data);

});

app.listen(PORT, () => {

  console.log("Server running on port", PORT);

});
