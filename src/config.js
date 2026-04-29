const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const releaseDir = path.join(rootDir, ".bot-release");
const port = Number(process.env.PORT || 3000);

const config = {
  version: "3.8.4c",
  timezone: "Asia/Jakarta",
  rootDir,
  dataDir,
  releaseDir,
  botToken: process.env.BOT_TOKEN,
  port,
  ownerId: String(process.env.OWNER_ID || "").trim(),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:" + port + "/oauth2callback",
  encryptionKey: process.env.ENCRYPTION_KEY || "assetra-default-key-change-me",
  files: {
    token: path.join(dataDir, "google-token.enc"),
    tokenDir: path.join(dataDir, "tokens"),
    update: path.join(dataDir, "update-state.json"),
    roles: path.join(dataDir, "roles.json"),
    allowed: path.join(dataDir, "allowed-users.json"),
    meta: path.join(dataDir, "allowed-user-meta.json"),
    log: path.join(dataDir, "bot.log"),
    flowDir: path.join(dataDir, "flows"),
    checkingDir: path.join(dataDir, "checking-results"),
  },
};

if (!config.botToken) {
  console.error("❌ BOT_TOKEN tidak ada di .env");
  process.exit(1);
}

module.exports = { config };

