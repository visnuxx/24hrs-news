const express = require("express");
const { getFeed } = require("../services/feedService");
const { getBriefing } = require("../services/briefingService");
const { FEEDS } = require("../config/newsConfig");

const router = express.Router();

router.get("/news/international", async (req, res) => {
  try { res.json(await getFeed("international")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

router.get("/news/tamil-nadu", async (req, res) => {
  try { res.json(await getFeed("tamilNadu")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

router.get("/news/tamil", async (req, res) => {
  try { res.json(await getFeed("tamil")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

router.get("/news/briefing/:feedKey", async (req, res) => {
  const { feedKey } = req.params;

  if (!FEEDS[feedKey]) {
    return res.status(404).json({ error: `Unknown feedKey: ${feedKey}` });
  }

  try {
    res.json(await getBriefing(feedKey));
  } catch (err) {
    console.error("[briefing] Route error:", err.message);
    res.status(500).json({ error: "Failed to generate briefing" });
  }
});

module.exports = router;
