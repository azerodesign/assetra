const { config } = require("../config");

function userLabel(user = {}) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Tanpa Nama";
  const username = user.username ? "@" + user.username : "";
  return name + (username ? " (" + username + ")" : "");
}

function idDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID", {
      timeZone: config.timezone,
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
}

function chunkText(text, limit = 3500) {
  const chunks = [];
  let current = String(text || "");
  while (current.length > limit) {
    chunks.push(current.slice(0, limit));
    current = current.slice(limit);
  }
  if (current) chunks.push(current);
  return chunks;
}

function escapeHtml(text = "") {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = { userLabel, idDate, chunkText, escapeHtml };

