const { config } = require("../config");
const { readJson, writeJson } = require("../utils/fs");

function loadRoles() {
  const roles = readJson(config.files.roles, {});
  if (config.ownerId) roles[config.ownerId] = "owner";
  writeJson(config.files.roles, roles);
  return roles;
}

function saveRoles(roles) {
  if (config.ownerId) roles[config.ownerId] = "owner";
  writeJson(config.files.roles, roles || {});
}

function isOwner(id) {
  return String(id || "") === config.ownerId;
}

function getRole(id) {
  const uid = String(id || "");
  if (isOwner(uid)) return "owner";
  return loadRoles()[uid] || "user";
}

function canManageBot(id) {
  const role = getRole(id);
  return role === "owner" || role === "admin";
}

module.exports = { loadRoles, saveRoles, isOwner, getRole, canManageBot };

