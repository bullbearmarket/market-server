const expiries = {
  NIFTY: [],
  BANKNIFTY: []
};

function detectExpiries(instruments){

  if(!Array.isArray(instruments)){
    console.log("No instruments received");
    return;
  }

  expiries.NIFTY = [];
  expiries.BANKNIFTY = [];

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

  expiries.NIFTY.sort();
  expiries.BANKNIFTY.sort();

  console.log("Expiry detection completed");
}

function getExpiries(){
  return expiries;
}

module.exports = {
  detectExpiries,
  getExpiries
};
