const path = require("path");
const { config } = require("../config");
const { readJson, writeJson, safeUnlink, ensureDir } = require("../utils/fs");

function flowFileFor(id) {
  return path.join(config.files.flowDir, String(id) + ".json");
}

function getFlow(id) {
  return readJson(flowFileFor(id), null);
}

function setFlow(id, flow) {
  ensureDir(config.files.flowDir);
  writeJson(flowFileFor(id), {
    ...flow,
    userId: String(id),
    updatedAt: new Date().toISOString(),
  });
}

function clearFlow(id) {
  safeUnlink(flowFileFor(id));
}

module.exports = { getFlow, setFlow, clearFlow };

