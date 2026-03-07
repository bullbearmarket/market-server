const axios = require("axios");
const zlib = require("zlib");
const fs = require("fs");
const csv = require("csv-parser");

const INSTRUMENT_URL =
"https://assets.upstox.com/market-quote/instruments/exchange/complete.csv.gz";

let instrumentData = [];

async function downloadInstrumentFile() {

console.log("Downloading instruments...");

const res = await axios({
url: INSTRUMENT_URL,
method: "GET",
responseType: "arraybuffer"
});

const buffer = zlib.gunzipSync(res.data);

fs.writeFileSync("./instruments.csv", buffer);

console.log("Instrument file saved");

}

async function parseInstrumentFile() {

return new Promise((resolve) => {

const results = [];

fs.createReadStream("./instruments.csv")

.pipe(csv())

.on("data", (row) => {

if (
row.name === "NIFTY" &&
row.instrument_type === "OPTIDX"
) {

results.push(row);

}

})

.on("end", () => {

instrumentData = results;

console.log("NIFTY options loaded:", results.length);

resolve();

});

});

}

function getInstruments() {

return instrumentData;

}

module.exports = {

downloadInstrumentFile,
parseInstrumentFile,
getInstruments

};
