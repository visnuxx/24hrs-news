const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
app.use(cors());

const FEEDS = {
  international: [
    { url: "http://feeds.bbci.co.uk/news/rss.xml", source: "BBC News" },
    { url: "https://news.google.com/rss/search?q=world+news&hl=en-IN&gl=IN&ceid=IN:en", source: "Google News" },
  ],
  tamilNadu: [
    { url: "https://news.google.com/rss/search?q=tamil+nadu&hl=en-IN&gl=IN&ceid=IN:en", source: "Google News" },
    {url:"https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", source:"Hindu News"},
  ],
};

async function parseFeed({ url, source }) {
  const response = await axios.get(url, { timeout: 8000 });
  const data = await xml2js.parseStringPromise(response.data);
  const items = data.rss.channel[0].item || [];
  return items.map((item) => ({
    title: item.title[0],
    link: item.link[0],
    pubDate: item.pubDate ? item.pubDate[0] : null,
    source: source,
  }));
}

app.get("/news/international", async (req, res) => {
  try {
    const results = await Promise.all(FEEDS.international.map(parseFeed));
    res.json(results.flat());
  } catch (err) {
    res.status(500).send("error fetching news");
  }
});

app.get("/news/tamil-nadu", async (req, res) => {
  try {
    const results = await Promise.all(FEEDS.tamilNadu.map(parseFeed));
    res.json(results.flat());
  } catch (err) {
    res.status(500).send("error fetching news");
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));