export const API_BASE = "https://two4hrs-news.onrender.com";

export const FEEDS = [
  { key:"tamil-nadu",    label:"Tamil Nadu",    taLabel:"தமிழ்நாடு", endpoint:"/news/tamil-nadu",    summaryKey:"tamilNadu",     digestKey:"tamilNadu",     accent:"#1D9E75", fill:"#E1F5EE", ink:"#085041" },
  { key:"international", label:"International", taLabel:"உலகம்",     endpoint:"/news/international", summaryKey:"international", digestKey:"international", accent:"#185FA5", fill:"#E6F1FB", ink:"#0C447C" },
];

export const TAMIL_FEED = { key:"tamil", label:"Tamil", accent:"#854F0B", fill:"#FAEEDA", ink:"#633806" };

export const CATEGORIES = {
  Politics:      { bg:"#FEF3C7", ink:"#92400E", darkBg:"#412402", darkInk:"#FAC775", icon:"🏛" },
  Business:      { bg:"#D1FAE5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"📈" },
  Technology:    { bg:"#EDE9FE", ink:"#5B21B6", darkBg:"#26215C", darkInk:"#C4B5FD", icon:"💻" },
  Sports:        { bg:"#DBEAFE", ink:"#1E40AF", darkBg:"#042C53", darkInk:"#93C5FD", icon:"⚽" },
  Crime:         { bg:"#FEE2E2", ink:"#991B1B", darkBg:"#501313", darkInk:"#FCA5A5", icon:"🔍" },
  Entertainment: { bg:"#FCE7F3", ink:"#9D174D", darkBg:"#4B1528", darkInk:"#F9A8D4", icon:"🎬" },
  Health:        { bg:"#D1FAE5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"🏥" },
  Climate:       { bg:"#ECFDF5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"🌍" },
  World:         { bg:"#DBEAFE", ink:"#1E40AF", darkBg:"#042C53", darkInk:"#93C5FD", icon:"🌐" },
  Conflict:      { bg:"#FEE2E2", ink:"#991B1B", darkBg:"#501313", darkInk:"#FCA5A5", icon:"⚔" },
  News:          { bg:"#F3F4F6", ink:"#374151", darkBg:"#2C2C2A", darkInk:"#D1D5DB", icon:"📰" },
};


