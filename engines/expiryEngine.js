const fs = require("fs");
const path = require("path");

let expiries = {
  NIFTY: [],
  BANKNIFTY: []
};

function detectExpiries(instruments){

  if(!instruments){
    console.log("No instruments received");
    return;
  }

  if(!Array.isArray(instruments)){
    console.log("Instrument data is not array");
    return;
  }

  instruments.forEach((item)=>{

    if(!item) return;

    if(item.segment !== "NFO-OPT") return;

    if(item.name === "NIFTY"){

      if(!expiries.NIFTY.includes(item.expiry)){
        expiries.NIFTY.push(item.expiry);
      }

    }

    if(item.name === "BANKNIFTY"){

      if(!expiries.BANKNIFTY.includes(item.expiry)){
        expiries.BANKNIFTY.push(item.expiry);
      }

    }

  });

  console.log("Expiry detection completed");
}

function getExpiries(){
  return expiries;
}

module.exports = {
  detectExpiries,
  getExpiries
};
