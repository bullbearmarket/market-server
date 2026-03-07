const axios = require("axios");
const admin = require("firebase-admin");

const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bullbearmarket7-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

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

        console.log(err);

    }

}

setInterval(fetchMarket, 5000);