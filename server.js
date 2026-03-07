const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 10000;

/* FIREBASE */

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://bullbearmarket7-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

/* AXIOS CLIENT */

const api = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
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

   const axiosInstance = axios.create({
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/option-chain"
  }
});

await axiosInstance.get("https://www.nseindia.com");
    
await new Promise(resolve => setTimeout(resolve, 1500));
    
const response = await axiosInstance.get(
  "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY"
);

   if (!response.data || !response.data.records) {
  console.log("NSE returned empty response");
  return;
} 
    const records = response.data.records.data;
    const spot = response.data.records.underlyingValue;

    const atm = Math.round(spot / 50) * 50;

    let strikes = {};

    records.forEach(item => {

      if (
        item.strikePrice >= atm - 250 &&
        item.strikePrice <= atm + 250
      ) {

        if (item.CE && item.PE) {

          strikes[item.strikePrice] = {

            ce: item.CE.lastPrice,
            pe: item.PE.lastPrice,
            ce_oi: item.CE.openInterest,
            pe_oi: item.PE.openInterest

          };

        }

      }

    });

    const optionData = {
      spot: spot,
      atm: atm,
      strikes: strikes,
      time: Date.now()
    };

    await db.ref("optionchain/nifty").set(optionData);

    console.log("Option chain updated");

  } catch (err) {

    console.log("Option Chain Error:", err.message);

  }

}

/* UPDATE INTERVAL */

setInterval(fetchMarket, 20000);   // 20 sec
setInterval(fetchOptionChain, 60000); // 60 sec

/* SERVER */

app.get("/", (req, res) => {
  res.send("BullBear Market Server Running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});






