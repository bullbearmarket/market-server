const admin = require("firebase-admin");

const db = admin.database();

function startCommunityCleaner(){

setInterval(async ()=>{

console.log("Cleaning old community messages...");

const now = Date.now();

const snapshot = await db.ref("community/messages").once("value");

snapshot.forEach(child=>{

const msg = child.val();

if(!msg.timestamp) return;

const age = now - msg.timestamp;

let limit = 4 * 60 * 60 * 1000; // 4 hours

if(msg.isOwner === true){
limit = 48 * 60 * 60 * 1000; // 48 hours
}

if(age > limit){

child.ref.remove();

}

});

},600000); // run every 10 minutes

}

module.exports = { startCommunityCleaner };
