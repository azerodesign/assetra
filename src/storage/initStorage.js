const fs = require("fs");
const { config } = require("../config");
const { ensureDir, writeJson } = require("../utils/fs");

function initializeStorage() {
  ensureDir(config.dataDir);
  ensureDir(config.releaseDir);

  if (!fs.existsSync(config.files.roles)) writeJson(config.files.roles, config.ownerId ? { [config.ownerId]: "owner" } : {});
  if (!fs.existsSync(config.files.allowed)) writeJson(config.files.allowed, []);
  if (!fs.existsSync(config.files.meta)) writeJson(config.files.meta, {});
  if (!fs.existsSync(config.files.update)) {
    writeJson(config.files.update, {
      active: false,
      message: "⚙️ Bot sedang update sebentar. Balik lagi nanti ya.",
      startedAt: null,
      endedAt: null,
      lastNotice: {},
    });
  }
}

module.exports = { initializeStorage };

