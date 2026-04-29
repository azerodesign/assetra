const fs = require("fs");
const { config } = require("../config");
const { isOwner, loadRoles } = require("../storage/roleStore");
const { loadAllowedUsers } = require("../storage/userStore");
const { loadUpdateState } = require("../storage/updateStore");
const { verifyOAuthToken } = require("../services/oauth");
const { mainKeyboard } = require("../ui/keyboards");

async function sendSelfcheck(ctx) {
  if (!isOwner(String(ctx.from?.id || ""))) return ctx.reply("⛔ Owner only.");

  const mem = process.memoryUsage();
  const oauth = await verifyOAuthToken();

  const lines = [
    "🧠 SELFCHECK v" + config.version,
    "",
    "Status: ✅ Online",
    "Owner ID: " + (config.ownerId || "belum diset"),
    "Allowed Users: " + loadAllowedUsers().length,
    "Roles: " + Object.keys(loadRoles()).length,
    "Update Mode: " + (loadUpdateState().active ? "AKTIF" : "tidak"),
    "OAuth: " + oauth.status,
    "Node: " + process.version,
    "Uptime: " + Math.floor(process.uptime()) + "s",
    "RSS: " + Math.round(mem.rss / 1024 / 1024) + "MB",
    "Log: " + (fs.existsSync(config.files.log) ? Math.round(fs.statSync(config.files.log).size / 1024) + "KB" : "0KB"),
  ];

  return ctx.reply(lines.join("\n"), mainKeyboard(true));
}

function registerSelfcheckCommands(bot) {
  bot.command("selfcheck", async (ctx) => sendSelfcheck(ctx));
}

module.exports = { registerSelfcheckCommands, sendSelfcheck };

