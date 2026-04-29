const { config } = require("../config");
const { readJson, writeJson } = require("../utils/fs");

const fallback = {
  active: false,
  message: "⚙️ Bot sedang update sebentar. Balik lagi nanti ya.",
  startedAt: null,
  endedAt: null,
  lastNotice: {},
};

function loadUpdateState() {
  return readJson(config.files.update, fallback);
}

function saveUpdateState(state) {
  writeJson(config.files.update, state || fallback);
}

module.exports = { loadUpdateState, saveUpdateState };

