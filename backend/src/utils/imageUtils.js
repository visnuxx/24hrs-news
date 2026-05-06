function extractImage(item) {
  const mediaContent = item["media:content"];
  if (mediaContent) {
    const nodes = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
      if (typeof node === "string" && isImageUrl(node)) return node;
    }
  }

  const mediaThumbnail = item["media:thumbnail"];
  if (mediaThumbnail) {
    const nodes = Array.isArray(mediaThumbnail) ? mediaThumbnail : [mediaThumbnail];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
      if (typeof node === "string" && isImageUrl(node)) return node;
    }
  }

  const enclosure = item.enclosure;
  if (enclosure) {
    const nodes = Array.isArray(enclosure) ? enclosure : [enclosure];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
    }
  }

  if (item.image) {
    const img = Array.isArray(item.image) ? item.image[0] : item.image;
    const url = img.url ? (Array.isArray(img.url) ? img.url[0] : img.url) : null;
    if (url && isImageUrl(url)) return url;
  }

  const desc = item.description
    ? Array.isArray(item.description) ? item.description[0] : item.description
    : null;
  if (desc && typeof desc === "string") {
    const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && isImageUrl(imgMatch[1])) return imgMatch[1];
  }

  const contentEncoded = item["content:encoded"];
  if (contentEncoded) {
    const raw = Array.isArray(contentEncoded) ? contentEncoded[0] : contentEncoded;
    const imgMatch = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && isImageUrl(imgMatch[1])) return imgMatch[1];
  }

  return null;
}

function isImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http")) return false;
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) ||
    url.includes("/image/") ||
    url.includes("/images/") ||
    url.includes("/img/") ||
    url.includes("/photo/") ||
    url.includes("/photos/") ||
    url.includes("/media/") ||
    url.includes("wsj.net") ||
    url.includes("bbci.co.uk") ||
    url.includes("thehindu") ||
    url.includes("ichef") ||
    url.includes("cloudfront") ||
    url.includes("wp-content");
}

module.exports = { extractImage, isImageUrl };

