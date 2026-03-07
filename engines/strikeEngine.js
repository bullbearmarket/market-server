let ladder = {
  NIFTY: [],
  BANKNIFTY: []
};

function roundToStep(price, step){

  return Math.round(price / step) * step;

}

function buildLadder(symbol, price){

  let step = 50;

  if(symbol === "BANKNIFTY") step = 100;

  const atm = roundToStep(price, step);

  let strikes = [];

  for(let i = -20; i <= 20; i++){

    strikes.push(atm + i * step);

  }

  ladder[symbol] = strikes;

}

function getStrikes(symbol){

  return ladder[symbol] || [];

}

module.exports = {
  buildLadder,
  getStrikes
};
