const { google } = require("googleapis");
const { config } = require("../config");
const { loadToken, saveToken } = require("../storage/tokenStore");
const { idDate } = require("../utils/format");
const { logger } = require("./logger");

function makeOAuthClient() {
  if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum lengkap di .env");
  }
  return new google.auth.OAuth2(config.googleClientId, config.googleClientSecret, config.googleRedirectUri);
}

function generateAuthUrl(userId) {
  const uid = String(userId || "");
  if (!uid) throw new Error("User ID kosong untuk OAuth.");

  const oauth2 = makeOAuthClient();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
    state: uid,
  });
}

async function exchangeCodeAndSaveToken(code, userId) {
  const uid = String(userId || "");
  if (!uid) throw new Error("State OAuth kosong. Ulangi /auth dari Telegram.");

  const oauth2 = makeOAuthClient();
  const { tokens } = await oauth2.getToken(String(code));
  saveToken(uid, tokens);
  return tokens;
}

async function verifyOAuthToken(userId) {
  const uid = String(userId || config.ownerId || "");
  const tokens = loadToken(uid);

  if (!tokens) {
    return {
      ok: false,
      status: "no_token",
      message: "❌ Akun Telegram ini belum terhubung ke Google Drive. Klik 🔐 Auth Google dulu.",
    };
  }

  let oauth2;
  try {
    oauth2 = makeOAuthClient();
  } catch (err) {
    return { ok: false, status: "config_error", message: "❌ " + err.message };
  }

  oauth2.setCredentials(tokens);

  try {
    if (!tokens.access_token) throw new Error("access_token missing");
    const info = await oauth2.getTokenInfo(tokens.access_token);

    return {
      ok: true,
      status: "valid",
      message: "✅ Token valid. Kedaluwarsa: " + (info.expiry_date ? idDate(info.expiry_date) : "tidak diketahui"),
    };
  } catch {
    if (!tokens.refresh_token) {
      return {
        ok: false,
        status: "expired_no_refresh",
        message: "⚠️ Token expired dan tidak punya refresh_token. Klik 🔐 Auth Google ulang.",
      };
    }

    try {
      const res = await oauth2.refreshAccessToken();
      saveToken(uid, { ...tokens, ...(res.credentials || {}) });

      return {
        ok: true,
        status: "refreshed",
        message: "✅ Token expired tapi berhasil direfresh. Sekarang valid.",
      };
    } catch (err) {
      logger.error("OAuth refresh failed:", err.message);
      return {
        ok: false,
        status: "invalid",
        message: "❌ Token Google invalid. Klik 🔐 Auth Google ulang.",
      };
    }
  }
}

module.exports = { makeOAuthClient, generateAuthUrl, exchangeCodeAndSaveToken, verifyOAuthToken };

