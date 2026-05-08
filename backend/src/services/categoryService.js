const KEYWORD_RULES = [
  {
    label: "Politics",
    exact: ["election", "elections", "vote", "votes", "voting", "campaign",
      "parliament", "minister", "government", "president", "manifesto",
      "dmk", "aiadmk", "bjp", "congress", "modi", "trump", "biden",
      "harris", "lok sabha", "rajya sabha", "mla", "mp", "constituency",
      "candidate", "candidates", "polling", "rally", "cabinet",
      "opposition", "ruling party", "by-election", "governor",
      "senate", "referendum", "ballot", "incumbent", "tvk", "edappadi",
      "palaniswami", "kanimozhi", "stalin", "dravidian",
      "à®¤à¯‡à®°à¯à®¤à®²à¯", "à®µà®¾à®•à¯à®•à¯", "à®…à®°à®šà¯", "à®…à®®à¯ˆà®šà¯à®šà®°à¯", "à®®à¯à®¤à®²à®®à¯ˆà®šà¯à®šà®°à¯", "à®†à®³à¯à®¨à®°à¯"],
    partial: ["prime minister", "chief minister", "political party", "poll result",
      "election result", "votes cast", "campaigns for"],
  },
  {
    label: "Conflict",
    exact: ["war", "wars", "missile", "missiles", "bomb", "bombs", "airstrike",
      "airstrikes", "troops", "soldier", "soldiers", "ceasefire",
      "hostage", "hamas", "hezbollah", "ukraine", "russia", "gaza",
      "israel", "iran", "nato", "artillery", "invasion", "shelling",
      "casualties", "idf", "irgc", "frontline",
      "à®ªà¯‹à®°à¯", "à®¤à®¾à®•à¯à®•à¯à®¤à®²à¯", "à®ªà®Ÿà¯ˆà®•à®³à¯"],
    partial: ["military operation", "armed forces", "terror attack", "suicide bomb",
      "rocket fire", "ground offensive"],
  },
  {
    label: "Sports",
    exact: ["cricket", "ipl", "t20", "odi", "bcci", "football", "fifa",
      "tennis", "wimbledon", "olympic", "olympics", "nba", "nfl",
      "golf", "boxing", "ufc", "wicket", "batting", "bowling",
      "wickets", "innings", "over", "penalty", "goalkeeper", "striker",
      "à®•à®¿à®°à®¿à®•à¯à®•à¯†à®Ÿà¯", "à®•à®¾à®²à¯à®ªà®¨à¯à®¤à¯", "à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯", "à®’à®²à®¿à®®à¯à®ªà®¿à®•à¯"],
    partial: ["premier league", "champions league", "la liga", "formula 1",
      "grand prix", "series win", "world cup", "test match",
      "match preview", "match report", "transfer window", "signed for",
      "sports news", "ipl 2025", "ipl 2026"],
  },
  {
    label: "Technology",
    exact: ["ai", "openai", "chatgpt", "gemini", "gpt", "nvidia", "iphone",
      "android", "5g", "semiconductor", "cybersecurity", "algorithm",
      "smartphone", "laptop", "robot", "robotics", "satellite", "drone",
      "drones", "spacex", "tesla", "microsoft", "apple", "google",
      "meta", "software", "hardware", "startup", "startups",
      "à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ªà®®à¯", "à®šà¯†à®¯à®±à¯à®•à¯ˆ à®¨à¯à®£à¯à®£à®±à®¿à®µà¯"],
    partial: ["artificial intelligence", "machine learning", "data breach",
      "electric vehicle", "tech company", "tech giant", "cloud computing",
      "quantum computing", "generative ai"],
  },
  {
    label: "Business",
    exact: ["gdp", "rupee", "inflation", "rbi", "sebi", "ipo", "merger",
      "acquisition", "tariff", "tariffs", "recession", "nse", "bse",
      "sensex", "nifty", "budget", "revenue", "profit", "earnings",
      "à®µà®£à®¿à®•à®®à¯", "à®ªà¯Šà®°à¯à®³à®¾à®¤à®¾à®°à®®à¯", "à®ªà®™à¯à®•à¯à®šà¯à®šà®¨à¯à®¤à¯ˆ"],
    partial: ["stock market", "interest rate", "trade deficit", "economic growth",
      "fiscal policy", "foreign investment", "market cap", "quarterly results",
      "world bank", "imf loan"],
  },
  {
    label: "Crime",
    exact: ["arrested", "murder", "robbery", "fraud", "accused", "verdict",
      "convicted", "jail", "prison", "fir", "cbi", "cid", "smuggling",
      "kidnap", "kidnapped", "assault", "rape", "detained", "custody",
      "bail", "chargesheet", "trafficking",
      "à®•à¯ˆà®¤à¯", "à®•à¯Šà®²à¯ˆ", "à®¤à®¿à®°à¯à®Ÿà¯à®Ÿà¯", "à®®à¯‹à®šà®Ÿà®¿", "à®šà®¿à®±à¯ˆ"],
    partial: ["police arrest", "under investigation", "drug bust", "gang war",
      "court hearing", "sentenced to", "filed case"],
  },
  {
    label: "Health",
    exact: ["vaccine", "cancer", "diabetes", "epidemic", "pandemic", "icmr",
      "aiims", "outbreak", "mortality", "surgery",
      "à®‰à®Ÿà®²à¯à®¨à®²à®®à¯", "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à¯", "à®¨à¯‹à®¯à¯", "à®®à®°à¯à®¨à¯à®¤à¯"],
    partial: ["health ministry", "hospital", "mental health", "drug approval",
      "clinical trial", "death toll", "disease outbreak", "public health"],
  },
  {
    label: "Climate",
    exact: ["flood", "floods", "drought", "wildfire", "hurricane", "cyclone",
      "heatwave", "earthquake", "tsunami", "monsoon", "co2",
      "deforestation", "pollution",
      "à®µà¯†à®³à¯à®³à®®à¯", "à®µà®±à®Ÿà¯à®šà®¿", "à®ªà¯à®¯à®²à¯", "à®¨à®¿à®²à®¨à®Ÿà¯à®•à¯à®•à®®à¯", "à®®à®´à¯ˆ"],
    partial: ["climate change", "global warming", "net zero", "carbon emission",
      "renewable energy", "sea level", "fossil fuel", "green energy",
      "temperature record", "heat wave"],
  },
  {
    label: "Entertainment",
    exact: ["film", "movie", "cinema", "actor", "actress", "director",
      "album", "concert", "oscar", "grammy", "bollywood", "kollywood",
      "hollywood", "netflix", "hotstar", "celebrity", "ott",
      "à®¤à®¿à®°à¯ˆà®ªà¯à®ªà®Ÿà®®à¯", "à®šà®¿à®©à®¿à®®à®¾", "à®¨à®Ÿà®¿à®•à®°à¯", "à®¨à®Ÿà®¿à®•à¯ˆ", "à®‡à®šà¯ˆ", "à®ªà®¾à®Ÿà®²à¯"],
    partial: ["box office", "trailer release", "amazon prime", "music video",
      "award show", "film festival", "theatre release"],
  },
  {
    label: "World",
    exact: ["china", "usa", "europe", "france", "germany", "japan",
      "pakistan", "bangladesh", "myanmar", "africa", "brazil",
      "canada", "australia", "g20", "g7", "imf", "diplomacy",
      "sanctions", "ambassador", "treaty",
      "à®‰à®²à®•à®®à¯", "à®šà¯€à®©à®¾", "à®…à®®à¯†à®°à®¿à®•à¯à®•à®¾", "à®à®°à¯‹à®ªà¯à®ªà®¾"],
    partial: ["united nations", "foreign minister", "bilateral talks",
      "world bank", "sri lanka", "south asia"],
  },
];

const TAMIL_FALLBACK_RULES = [
  { label: "Politics", keywords: ["தேர்தல்", "வாக்கு", "அரசு", "அமைச்சர்", "முதலமைச்சர்", "ஆளுநர்", "அரசியல்"] },
  { label: "Conflict", keywords: ["போர்", "தாக்குதல்", "படைகள்", "ராணுவம்"] },
  { label: "Sports", keywords: ["கிரிக்கெட்", "கால்பந்து", "விளையாட்டு", "ஒலிம்பிக்"] },
  { label: "Technology", keywords: ["தொழில்நுட்பம்", "செயற்கை நுண்ணறிவு", "மொபைல்"] },
  { label: "Business", keywords: ["வணிகம்", "பொருளாதாரம்", "பங்குச்சந்தை"] },
  { label: "Crime", keywords: ["கைது", "கொலை", "திருட்டு", "மோசடி", "சிறை"] },
  { label: "Health", keywords: ["உடல்நலம்", "மருத்துவம்", "நோய்", "மருந்து", "மருத்துவமனை"] },
  { label: "Climate", keywords: ["வெள்ளம்", "வறட்சி", "புயல்", "நிலநடுக்கம்", "மழை"] },
  { label: "Entertainment", keywords: ["திரைப்படம்", "சினிமா", "நடிகர்", "நடிகை", "இசை", "பாடல்"] },
  { label: "World", keywords: ["உலகம்", "சீனா", "அமெரிக்கா", "ஐரோப்பா", "இலங்கை"] },
];

function keywordLabel(title) {
  const text = " " + title.toLowerCase() + " ";
  for (const rule of KEYWORD_RULES) {
    const exactHit = rule.exact.some((kw) => {
      const re = new RegExp(`(?<![a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`, "i");
      return re.test(text);
    });
    if (exactHit) return rule.label;
    const partialHit = rule.partial.some((kw) => text.includes(kw));
    if (partialHit) return rule.label;
  }
  for (const rule of TAMIL_FALLBACK_RULES) {
    if (rule.keywords.some((kw) => title.includes(kw))) return rule.label;
  }
  return "World";
}


module.exports = { keywordLabel, KEYWORD_RULES, TAMIL_FALLBACK_RULES };

