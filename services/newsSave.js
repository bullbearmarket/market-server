const admin = require("firebase-admin");
const { fetchNewsAPI, fetchFinnhub } = require("./newsService");

function generateSummary(text) {

if (!text) return "";

return text.substring(0,200) + "...";

}

function detectImpact(title) {

const keywords = [
"crash",
"rally",
"surge",
"bank",
"nifty",
"sensex",
"inflation",
"rate hike"
];

const lower = title.toLowerCase();

return keywords.some(k => lower.includes(k));

}

async function saveNews(newsList){

try{

const db = admin.database();
const ref = db.ref("news");

const snapshot = await ref.once("value");

const existing = [];

snapshot.forEach(s=>{
existing.push(s.val().title);
});

for(const item of newsList){

const title = item.title || "";

if(!title) continue;
  
if(existing.includes(title)) continue;

const data = {

title : title,
description : item.description || "",
url : item.url || "",
source : item.source?.name || "Market",
time : Date.now()

};

await ref.push(data);

}

}catch(err){

console.log("News Save Error",err);

}

}

async function runNewsAPI(){

const news = await fetchNewsAPI();

await saveNews(news);

}

async function runFinnhub(){

const news = await fetchFinnhub();

await saveNews(news);

}

module.exports = { runNewsAPI , runFinnhub };
