const express = require("express");
const cors = require("cors");
require("dotenv").config();

const newsRoutes = require("./src/routes/newsRoutes");
const cacheRoutes = require("./src/routes/cacheRoutes");
const { CACHE_DIR } = require("./src/config/newsConfig");
const { getFeed } = require("./src/services/feedService");

const app = express();
app.use(cors());
app.use(newsRoutes);
app.use(cacheRoutes);

setTimeout(() => {
  console.log("[warmup] Preloading feeds...");
  getFeed("international");
  getFeed("tamilNadu");
  getFeed("tamil");
}, 10000);

app.listen(5000, () => console.log("Server running on port 5000"));
