const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

/* FIREBASE */

const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bullbearmarket7-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

/* AXIOS CLIENT */

const api = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
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

    console.log("Market Update:", data);

    await db.ref("market").set(data);

  } catch (err) {

    if (err.response && err.response.status === 429) {

      console.log("Yahoo rate limited - waiting...");

    } else {

      console.log("Market Error:", err.message);

    }

  }

}

/* OPTION CHAIN */

async function fetchOptionChain() {

  try {

    const res = await api.get(
      "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY"
    );

    if (!res.data || !res.data.records) {

      console.log("Option chain empty");
      return;

    }

    const records = res.data.records.data;

    let optionData = {};

    records.forEach(item => {

      if (item.CE && item.PE) {

        optionData[item.strikePrice] = {

          ce: item.CE.lastPrice,
          pe: item.PE.lastPrice,
          ce_oi: item.CE.openInterest,
          pe_oi: item.PE.openInterest

        };

      }

    });

    await db.ref("optionchain/nifty").set(optionData);

    console.log("Option chain updated");

  } catch (err) {

    if (err.response && err.response.status === 429) {

      console.log("NSE rate limited - waiting...");

    } else {

      console.log("Option Chain Error:", err.message);

    }

  }

}

/* UPDATE INTERVAL */

setInterval(fetchMarket, 20000);     // 20 sec
setInterval(fetchOptionChain, 60000); // 60 sec

/* SERVER */

app.get("/", (req, res) => {

  res.send("BullBear Market Server Running");

});

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
