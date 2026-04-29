const fs = require("fs");
const path = require("path");
const { config } = require("../config");
const { encrypt, decrypt } = require("../utils/security");
const { ensureDir } = require("../utils/fs");
const { logger } = require("../services/logger");

function tokenFileFor(userId) {
  const uid = String(userId || config.ownerId || "owner");
  return path.join(config.files.tokenDir, uid + ".enc");
}

function loadLegacyOwnerToken() {
  try {
    if (!fs.existsSync(config.files.token)) return null;
    return JSON.parse(decrypt(fs.readFileSync(config.files.token, "utf8")));
  } catch (err) {
    logger.error("Legacy token load failed:", err.message);
    return null;
  }
}

function loadToken(userId) {
  try {
    const uid = String(userId || config.ownerId || "");
    const file = tokenFileFor(uid);

    if (fs.existsSync(file)) {
      return JSON.parse(decrypt(fs.readFileSync(file, "utf8")));
    }

    // Backward compatibility: owner can still read old data/google-token.enc
    if (uid === config.ownerId && fs.existsSync(config.files.token)) {
      return loadLegacyOwnerToken();
    }

    return null;
  } catch (err) {
    logger.error("Token load failed:", err.message);
    return null;
  }
}

function saveToken(userId, tokens) {
  const uid = String(userId || config.ownerId || "");
  if (!uid) throw new Error("userId token kosong.");

  ensureDir(config.files.tokenDir);
  fs.writeFileSync(tokenFileFor(uid), encrypt(JSON.stringify(tokens)));
}

function hasToken(userId) {
  const uid = String(userId || config.ownerId || "");
  if (!uid) return false;
  if (fs.existsSync(tokenFileFor(uid))) return true;
  return uid === config.ownerId && fs.existsSync(config.files.token);
}

module.exports = { tokenFileFor, loadToken, saveToken, hasToken };

