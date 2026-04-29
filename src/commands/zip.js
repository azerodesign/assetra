const { config } = require("../config");
const { isOwner } = require("../storage/roleStore");
const { validZipPassword } = require("../utils/security");
const { commandExists, buildPanelZip, buildPrivateZip, cleanZipRelease } = require("../services/zipBuilder");
const { logger } = require("../services/logger");

function registerZipCommands(bot) {
  bot.command("zipstatus", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    return ctx.reply(["📦 ZIP Status", "zip command: " + (commandExists("zip") ? "✅ ready" : "❌ tidak tersedia"), "Release dir: " + config.releaseDir].join("\n"));
  });

  bot.command("panelzip", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    try {
      await ctx.reply("📦 Building panel ZIP...");
      const result = buildPanelZip();
      await ctx.replyWithDocument({ source: result.zipPath, filename: result.buildName + ".zip" });
      return ctx.reply("✅ Panel ZIP siap.\nSHA256: " + result.hash);
    } catch (err) {
      logger.error("Panelzip failed:", err.message);
      return ctx.reply("❌ Gagal panelzip: " + err.message);
    }
  });

  bot.command("privatezip", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const pwd = ctx.message.text.split(/\s+/)[1];
    if (!pwd || pwd.length < 6) return ctx.reply("Format: /privatezip <password>\nMin. 6 karakter.");
    if (!validZipPassword(pwd)) return ctx.reply("❌ Password hanya boleh huruf, angka, titik, underscore, @, dan dash. Panjang 6-64 karakter.");

    try {
      await ctx.reply("🔐 Building private ZIP...");
      const result = buildPrivateZip(pwd);
      await ctx.replyWithDocument({ source: result.zipPath, filename: result.buildName + ".zip" });
      return ctx.reply("🔐 Private ZIP terenkripsi.\nSHA256: " + result.hash + "\n⚠️ Jangan bagikan file/password ini.");
    } catch (err) {
      logger.error("Privatezip failed:", err.message);
      return ctx.reply("❌ Gagal privatezip: " + err.message);
    }
  });

  bot.command("cleanzip", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    try {
      cleanZipRelease();
      return ctx.reply("🧹 Release folder sudah dibersihkan.");
    } catch (err) {
      return ctx.reply("❌ Gagal cleanzip: " + err.message);
    }
  });
}

module.exports = { registerZipCommands };

