const express = require("express");
const axios = require("axios")
const xml2js = require("xml2js")
const cors = require("cors")

const app = express()
app.use(cors())

const RSS_URL_international = "http://feeds.bbci.co.uk/news/rss.xml"
const RSS_URL_tamil_nadu = "https://news.google.com/rss/search?q=tamil+nadu&hl=en-IN&gl=IN&ceid=IN:en"

app.get("/news/international", async (req, res) => {
    try {
        const response = await axios.get(RSS_URL_international)
        const data = await xml2js.parseStringPromise(response.data)

        const item = data.rss.channel[0].item;

        const news = item.map(item => ({
            title: item.title[0],
            link: item.link[0],
            pubDate: item.pubDate[0]
        }))

        res.json(news)


    }
    catch (err) {
        res.status(500).send("error fetching news")
    }
})

app.get('/news/tamil-nadu', async (req, res) => {

    try {
        const response = await axios.get(RSS_URL_tamil_nadu)
        const data = await xml2js.parseStringPromise(response.data)

        const item = data.rss.channel[0].item;

        const news = item.map(item => ({
            title: item.title[0],
            link: item.link[0],
            pubDate: item.pubDate[0]
        }))

        res.json(news)


    }
    catch (err) {
        res.status(500).send("error fetching news")
    }
})

app.listen(5000, () =>
    console.log("Server Started...!")
)