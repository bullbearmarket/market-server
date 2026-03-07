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

/* MARKET INDEX DATA */

async function fetchMarket() {

  try {

    const nifty = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI");
    const banknifty = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEBANK");
    const sensex = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN");

    const data = {

      nifty: nifty.data.chart.result[0].meta.regularMarketPrice,
      banknifty: banknifty.data.chart.result[0].meta.regularMarketPrice,
      sensex: sensex.data.chart.result[0].meta.regularMarketPrice,
      time: Date.now()

    };

    console.log("Market Update:", data);

    await db.ref("market").set(data);

  } catch (err) {

    console.log("Market error:", err);

  }

}

/* OPTION CHAIN */

async function fetchOptionChain() {

  try {

    const response = await axios.get(
      "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const records = response.data.records.data;

    let optionData = {};

    records.forEach(item => {

      if (item.CE && item.PE) {

        optionData[item.strikePrice] = {

          ce: item.CE.lastPrice,
          pe: item.PE.lastPrice

        };

      }

    });

    await db.ref("optionchain/nifty").set(optionData);

    console.log("Option Chain Updated");

  } catch (err) {

    console.log("Option chain error:", err);

  }

}

/* AUTO UPDATE */

setInterval(fetchMarket, 5000);
setInterval(fetchOptionChain, 10000);

/* SERVER */

app.get("/", (req, res) => {

  res.send("BullBear Market Server Running");

});

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
