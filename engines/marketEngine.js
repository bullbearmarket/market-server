const axios = require("axios");
const db = require("../firebase");

let market = {
  nifty: null,
  banknifty: null,
  sensex: null
};

async function fetchMarket() {

  try {

    // NIFTY
    const res = await axios.get(
      "https://www.google.com/finance/quote/NIFTY_50:INDEXNSE",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const html = res.data;
    const priceMatch = html.match(/data-last-price="([\d.]+)"/);

    if (priceMatch) {
      market.nifty = parseFloat(priceMatch[1]);
    }

    // BANKNIFTY
    const bank = await axios.get(
      "https://www.google.com/finance/quote/NIFTY_BANK:INDEXNSE",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const html2 = bank.data;
    const bankMatch = html2.match(/data-last-price="([\d.]+)"/);

    if (bankMatch) {
      market.banknifty = parseFloat(bankMatch[1]);
    }

    // 🔥 FIREBASE UPDATE (individual fields)
    await db.ref("market/nifty").set(market.nifty);
    await db.ref("market/banknifty").set(market.banknifty);

    console.log("Firebase market updated");

    console.log("Market Updated:", market);

  } catch (err) {

    console.log("Market Engine Error:", err.message);

  }

}

function startMarketEngine() {

  console.log("Market Engine Started");

  fetchMarket();

  setInterval(fetchMarket, 45000);

}

function getMarket() {
  return market;
}

module.exports = {
  startMarketEngine,
  getMarket
};
