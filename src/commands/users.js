const { config } = require("../config");
const { isOwner, getRole } = require("../storage/roleStore");
const { loadAllowedUsers, loadMeta, allowUser, revokeUser } = require("../storage/userStore");
const { idDate, chunkText } = require("../utils/format");
const { clearJob } = require("../storage/renameJobStore");

async function sendUsersList(ctx) {
  if (!isOwner(String(ctx.from?.id || ""))) return ctx.reply("⛔ Owner only.");

  const users = loadAllowedUsers();
  const meta = loadMeta();
  const lines = ["👥 Allowed Users", "", "Owner: " + (config.ownerId || "-"), ""];

  if (!users.length) lines.push("Belum ada allowed user.");
  else {
    users.forEach((id, index) => {
      const m = meta[id] || {};
      lines.push((index + 1) + ". " + (m.name || "Unknown"));
      lines.push("   ID: " + id);
      lines.push("   Role: " + getRole(id));
      lines.push("   Sejak: " + idDate(m.approvedAt));
    });
  }

  for (const chunk of chunkText(lines.join("\n"))) await ctx.reply(chunk);
}

function registerUserCommands(bot) {
  bot.command("allow", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const id = ctx.message.text.split(/\s+/)[1];
    if (!id || !/^\d+$/.test(id)) return ctx.reply("Format: /allow <telegram_id>");

    allowUser(id, { name: "Manual", username: "-", approvedAt: new Date().toISOString() });
    await ctx.reply("✅ User " + id + " diizinkan.");
    ctx.telegram.sendMessage(id, "✅ Akses kamu sudah diaktifkan owner. Ketik /start").catch(() => {});
  });

  bot.command("revoke", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const id = ctx.message.text.split(/\s+/)[1];
    if (!id || !/^\d+$/.test(id)) return ctx.reply("Format: /revoke <telegram_id>");
    if (id === config.ownerId) return ctx.reply("❌ Owner tidak bisa direvoke.");

    revokeUser(id);
    clearJob(id);
    return ctx.reply("✅ Akses " + id + " dicabut.");
  });

  bot.command("users", async (ctx) => sendUsersList(ctx));
}

module.exports = { registerUserCommands, sendUsersList };

