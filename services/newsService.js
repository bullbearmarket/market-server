const axios = require("axios");

// ENV VARIABLES (Render dashboard)
const NEWS_API = process.env.NEWS_API;
const FINNHUB_API = process.env.FINNHUB_API;


// ================= NEWSAPI =================

async function fetchNewsAPI(){

    try{

        const res = await axios.get(
            `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${NEWS_API}`
        );

        return res.data.articles || [];

    }catch(err){

        console.log("NewsAPI error:", err.message);
        return [];

    }

}


// ================= FINNHUB =================

async function fetchFinnhub(){

    try{

        const res = await axios.get(
            `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API}`
        );

        return res.data || [];

    }catch(err){

        console.log("Finnhub error:", err.message);
        return [];

    }

}


module.exports = { fetchNewsAPI, fetchFinnhub };
