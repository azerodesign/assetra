const path = require("path");
const { config } = require("../config");
const { readJson, writeJson, safeUnlink, ensureDir } = require("../utils/fs");

function checkingFileFor(id) {
  return path.join(config.files.checkingDir, String(id) + ".json");
}

function saveCheckingResult(id, result) {
  ensureDir(config.files.checkingDir);
  writeJson(checkingFileFor(id), {
    ...result,
    userId: String(id),
    createdAt: new Date().toISOString(),
  });
}

function loadCheckingResult(id) {
  return readJson(checkingFileFor(id), null);
}

function clearCheckingResult(id) {
  safeUnlink(checkingFileFor(id));
}

module.exports = { saveCheckingResult, loadCheckingResult, clearCheckingResult };

