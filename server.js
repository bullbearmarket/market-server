const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 10000;

/* FIREBASE INIT */

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB
});

const db = admin.database();

/* AXIOS CLIENT */

const api = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json"
  }
});

/* MARKET DATA */

async function fetchMarket() {

  try {

    const [nifty, banknifty, sensex] = await Promise.all([
      api.get("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI"),
      api.get("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEBANK"),
      api.get("https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN")
    ]);

    const data = {

      nifty: nifty.data.chart.result[0].meta.regularMarketPrice,
      banknifty: banknifty.data.chart.result[0].meta.regularMarketPrice,
      sensex: sensex.data.chart.result[0].meta.regularMarketPrice,
      time: Date.now()

    };

    await db.ref("market").set(data);

    console.log("Market Updated:", data);

  } catch (err) {

    console.log("Market Error:", err.message);

  }

}

/* OPTION CHAIN */

async function fetchOptionChain() {

  try {

   const res = await api.get(
"https://cdn.jsdelivr.net/gh/VarunS2002/nse-data/option-chain/nifty.json"
);

    const records = res.data.records.data;
    const spot = res.data.records.underlyingValue;

    const atm = Math.round(spot / 50) * 50;

    let strikes = {};

    records.forEach(item => {

      const strike = item.strikePrice;

      if (Math.abs(strike - atm) <= 500) {

        strikes[strike] = {

          CE: item.CE ? item.CE.lastPrice : null,
          PE: item.PE ? item.PE.lastPrice : null,
          CE_OI: item.CE ? item.CE.openInterest : null,
          PE_OI: item.PE ? item.PE.openInterest : null

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

/* SERVER ROUTE */

app.get("/", (req, res) => {

  res.send("BullBear Market Server Running");

});

/* UPDATE INTERVAL */

setInterval(fetchMarket, 20000);
setInterval(fetchOptionChain, 60000);

/* START SERVER */

app.listen(PORT, () => {

  console.log("Server running on port", PORT);

});

