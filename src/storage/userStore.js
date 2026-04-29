const { config } = require("../config");
const { readJson, writeJson } = require("../utils/fs");

function loadAllowedUsers() {
  return readJson(config.files.allowed, []).map(String);
}

function saveAllowedUsers(users) {
  const clean = [...new Set((users || []).map(String).filter(Boolean))];
  writeJson(config.files.allowed, clean);
}

function loadMeta() {
  return readJson(config.files.meta, {});
}

function saveMeta(meta) {
  writeJson(config.files.meta, meta || {});
}

function allowUser(id, patch = {}) {
  const uid = String(id);
  const users = loadAllowedUsers();
  if (!users.includes(uid)) users.push(uid);
  saveAllowedUsers(users);

  const meta = loadMeta();
  meta[uid] = { ...(meta[uid] || {}), id: uid, ...patch };
  saveMeta(meta);
}

function revokeUser(id) {
  const uid = String(id);
  saveAllowedUsers(loadAllowedUsers().filter((x) => x !== uid));
}

module.exports = { loadAllowedUsers, saveAllowedUsers, loadMeta, saveMeta, allowUser, revokeUser };

