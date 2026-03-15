const admin = require("../firebase");
const { fetchNewsAPI, fetchFinnhub } = require("./newsService");


// SHORT SUMMARY
function generateSummary(text){

    if(!text) return "";

    if(text.length < 200) return text;

    return text.substring(0,200) + "...";

}


// IMPACT DETECTOR
function detectImpact(title){

    if(!title) return false;

    const keywords = [
        "crash",
        "rally",
        "surge",
        "bank",
        "nifty",
        "sensex",
        "rate hike",
        "inflation"
    ];

    const lower = title.toLowerCase();

    return keywords.some(k => lower.includes(k));

}


// SAVE NEWS
async function saveNews(newsList){

    try{

        const db = admin.database();
        const ref = db.ref("market_news");

        const snapshot = await ref.once("value");

        const existing = [];

        snapshot.forEach(s=>{
            const data = s.val();
            if(data && data.title){
                existing.push(data.title);
            }
        });


        for(const item of newsList){

            const title = item.title || "";

            if(!title) continue;

            if(existing.includes(title)) continue;

            const data = {

                title: title,
                description: item.description || "",
                summary: generateSummary(item.description || ""),
                url: item.url || "",
                image: item.urlToImage || item.image || "",
                source: item.source?.name || "Market",
                impact: detectImpact(title),
                time: Date.now()

            };

            await ref.push(data);

        }

    }catch(err){

        console.log("SaveNews error:", err.message);

    }

}


// RUN NEWS API
async function runNewsAPI(){

    const news = await fetchNewsAPI();

    if(news.length > 0){
        await saveNews(news);
    }

}


// RUN FINNHUB
async function runFinnhub(){

    const news = await fetchFinnhub();

    if(news.length > 0){
        await saveNews(news);
    }

}


module.exports = { runNewsAPI, runFinnhub };
