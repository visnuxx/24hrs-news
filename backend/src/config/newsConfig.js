const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "..", ".cache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const FEEDS = {
  international: [
    { url: "http://feeds.bbci.co.uk/news/rss.xml", source: "BBC News" },
    {
      url: "https://news.google.com/rss/search?q=world+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News",
    },
  ],
  tamilNadu: [
    {
      url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss",
      source: "The Hindu",
    },
    {
      url: "https://news.google.com/rss/search?q=tamil+nadu&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News",
    },
    {
      url: "https://www.thenewsminute.com/feed",
      source: "The News Minute",
    },
    {
      url: "https://news.google.com/rss/search?q=chennai+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News Â· Chennai",
    },
    {
      url: "https://news.google.com/rss/search?q=coimbatore+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News Â· Coimbatore",
    },
    {
      url: "https://news.google.com/rss/search?q=madurai+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News Â· Madurai",
    },
    {
      url: "https://news.google.com/rss/search?q=trichy+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News Â· Trichy",
    },
    {
      url: "https://news.google.com/rss/search?q=salem+tamil+nadu+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News Â· Salem",
    },
  ],
  tamil: [
    {
      url: "https://rss.dinamalar.com/tamilnadunews.asp",
      source: "Dinamalar",
    },
    {
      url: "https://rss.dinamalar.com/?cat=ara1",
      source: "Dinamalar Â· à®…à®°à®šà®¿à®¯à®²à¯",
    },
    {
      url: "https://www.vikatan.com/rss",
      source: "Vikatan",
    },
    {
      url: "https://news.google.com/rss/search?q=à®¤à®®à®¿à®´à¯à®¨à®¾à®Ÿà¯&hl=ta&gl=IN&ceid=IN:ta",
      source: "Google News Â· à®¤à®®à®¿à®´à¯",
    },
    {
      url: "https://news.google.com/rss/search?q=à®šà¯†à®©à¯à®©à¯ˆ&hl=ta&gl=IN&ceid=IN:ta",
      source: "Google News Â· à®šà¯†à®©à¯à®©à¯ˆ",
    },
    {
      url: "https://tamil.oneindia.com/rss/feeds/tamilnadu-fb.xml",
      source: "oneindia",
    },
    {
      url: "https://tamil.news18.com/rss/tamil-nadu.xml",
      source: "News18 Tamil Nadu",
    },
    {
      url: "https://feeds.bbci.co.uk/tamil/rss.xml",
      source: "BBC News Tamil",
    },
  ],
};

const VALID_LABELS = [
  "Politics", "Business", "Technology", "Sports",
  "Crime", "Entertainment", "Health", "Climate", "World", "Conflict",
];

module.exports = { CACHE_DIR, CACHE_TTL_MS, FEEDS, VALID_LABELS };

