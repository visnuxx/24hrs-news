const express = require("express");
const fs = require("fs");
const { getCachePath } = require("../services/cacheService");
const { getBriefingCachePath } = require("../services/briefingService");

const router = express.Router();

router.delete("/cache/briefing/:feedKey", (req, res) => {
  const p = getBriefingCachePath(req.params.feedKey);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true, message: `Briefing cache cleared for "${req.params.feedKey}"` });
});

router.delete("/cache/:feedKey", (req, res) => {
  const cachePath = getCachePath(req.params.feedKey);
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  res.json({ ok: true, message: `Cache cleared for "${req.params.feedKey}"` });
});

module.exports = router;
