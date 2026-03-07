const fs = require("fs");
const path = require("path");

let expiries = {
  NIFTY: [],
  BANKNIFTY: []
};

function detectExpiries(instruments){

  instruments.forEach((item)=>{

    if(item.segment !== "NFO-OPT") return;

    if(item.name === "NIFTY"){

      if(!expiries.NIFTY.includes(item.expiry))
        expiries.NIFTY.push(item.expiry);

    }

    if(item.name === "BANKNIFTY"){

      if(!expiries.BANKNIFTY.includes(item.expiry))
        expiries.BANKNIFTY.push(item.expiry);

    }

  });

  expiries.NIFTY.sort();
  expiries.BANKNIFTY.sort();

}

function getNearestExpiry(symbol){

  const today = new Date();

  let list = expiries[symbol];

  for(let e of list){

    let d = new Date(e);

    if(d >= today) return e;

  }

  return null;

}

module.exports = {
  detectExpiries,
  getNearestExpiry
};
