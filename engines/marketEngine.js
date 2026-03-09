const axios = require("axios");

let market = {
  nifty: null,
  banknifty: null,
  sensex: null
};

async function fetchMarket() {

  try {

    const res = await axios.get(
      "https://www.google.com/finance/quote/NIFTY_50:INDEXNSE"
    );

    const html = res.data;

    const priceMatch = html.match(/data-last-price="([\d.]+)"/);

    if (priceMatch) {

      market.nifty = parseFloat(priceMatch[1]);

    }

    const bank = await axios.get(
      "https://www.google.com/finance/quote/NIFTY_BANK:INDEXNSE"
    );

    const html2 = bank.data;

    const bankMatch = html2.match(/data-last-price="([\d.]+)"/);

    if (bankMatch) {

      market.banknifty = parseFloat(bankMatch[1]);

    }

    console.log("Market Updated:", market);

  } catch (err) {

    console.log("Market Fetch Error:", err.message);

  }

}

function startMarketEngine() {

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
