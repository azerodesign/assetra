const path = require("path");
const { config } = require("../config");
const { readJson, writeJson, safeUnlink } = require("../utils/fs");

function jobFileFor(id) {
  return path.join(config.dataDir, "rename-job-" + String(id) + ".json");
}

function loadJob(id) {
  return readJson(jobFileFor(id), null);
}

function saveJob(id, job) {
  writeJson(jobFileFor(id), {
    ...job,
    ownerId: String(id),
    createdAt: new Date().toISOString(),
  });
}

function clearJob(id) {
  safeUnlink(jobFileFor(id));
}

module.exports = { loadJob, saveJob, clearJob };

