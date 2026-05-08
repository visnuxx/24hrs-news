const express = require("express");
const cors = require("cors");
require("dotenv").config();

const newsRoutes = require("./src/routes/newsRoutes");
const cacheRoutes = require("./src/routes/cacheRoutes");
const { getFeed } = require("./src/services/feedService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use(newsRoutes);
app.use(cacheRoutes);

setTimeout(() => {
  console.log("[warmup] Preloading feeds...");
  Promise.allSettled([
    getFeed("international"),
    getFeed("tamilNadu"),
    getFeed("tamil"),
  ]).then((results) => {
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length > 0) {
      console.warn(`[warmup] ${failed.length} feed preload job(s) failed`);
    }
  });
}, 10000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
