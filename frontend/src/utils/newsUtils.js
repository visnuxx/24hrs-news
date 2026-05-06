import { CATEGORIES } from "../constants/news.js";

export const getCat = (label) => CATEGORIES[label] || CATEGORIES.News;
export const cityFromSource = (src) => { if (!src) return null; const m = src.match(/Google News · (.+)/); return m ? m[1] : null; };
export const sourceLabel = (src) => cityFromSource(src) || src || "";
export const initials = (src) => { if (!src) return "?"; const c = cityFromSource(src); if (c) return c.slice(0, 2).toUpperCase(); return src.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(); };
export const timeAgo = (d) => { if (!d) return ""; const s = Math.floor((Date.now() - new Date(d)) / 1000); if (isNaN(s) || s < 0) return ""; if (s < 60) return "now"; if (s < 3600) return Math.floor(s / 60) + "m ago"; if (s < 86400) return Math.floor(s / 3600) + "h ago"; return Math.floor(s / 86400) + "d ago"; };
export const formatDate = (iso) => { if (!iso) return ""; const d = new Date(iso); return d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" }) + " · " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }); };
export const formatFullDate = (iso) => { if (!iso) return ""; return new Date(iso).toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" }); };
export const whatsappShare = (title, link) => window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${link}`)}`, "_blank");

// ---------- Category Badge ----------

