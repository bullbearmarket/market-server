const axios = require("axios");

const NEWS_API = process.env.NEWS_API_KEY;
const FINNHUB_API = process.env.FINNHUB_API_KEY;

async function fetchNewsAPI() {

    try {

        const res = await axios.get(
            `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${NEWS_API}`
        );

        return res.data.articles;

    } catch (err) {

        console.log("NewsAPI error");

        return [];
    }
}

async function fetchFinnhub() {

    try {

        const res = await axios.get(
            `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API}`
        );

        return res.data;

    } catch (err) {

        console.log("Finnhub error");

        return [];
    }
}

module.exports = { fetchNewsAPI, fetchFinnhub };
