import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== Worker URL (तुम्हारा Cloudflare worker) ===== */
const OPTION_CHAIN_API =
  "https://lingering-math-11eb.moneymaker-earnmoney.workers.dev";

/* ===== Market spot dummy endpoint example ===== */
let market = {
  nifty: 0,
};

/* ===== OPTION CHAIN FETCH ===== */
async function fetchOptionChain() {
  try {
    const res = await axios.get(OPTION_CHAIN_API);

    const records = res.data.records.data;
    const spot = res.data.records.underlyingValue;

    market.nifty = spot;

    const atm = Math.round(spot / 50) * 50;

    let strikes = {};

    records.forEach((item) => {
      const strike = item.strikePrice;

      if (Math.abs(strike - atm) <= 500) {
        strikes[strike] = {
          CE_LTP: item.CE?.lastPrice || 0,
          PE_LTP: item.PE?.lastPrice || 0,
          CE_OI: item.CE?.openInterest || 0,
          PE_OI: item.PE?.openInterest || 0,
          CE_CHANGE_OI: item.CE?.changeinOpenInterest || 0,
          PE_CHANGE_OI: item.PE?.changeinOpenInterest || 0,
        };
      }
    });

    console.log("Option Chain Updated | ATM:", atm);

    return {
      spot,
      atm,
      strikes,
    };
  } catch (err) {
    console.log("Option Chain Error:", err.message);
  }
}

/* ===== API endpoint ===== */
app.get("/option-chain", async (req, res) => {
  const data = await fetchOptionChain();
  res.json(data);
});

/* ===== health endpoint ===== */
app.get("/", (req, res) => {
  res.send("Server Running");
});

/* ===== start server ===== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ===== refresh option chain ===== */
setInterval(fetchOptionChain, 20000);
