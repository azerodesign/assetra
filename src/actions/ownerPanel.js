const { isOwner } = require("../storage/roleStore");
const { sendOAuthStatus } = require("../commands/oauth");
const { sendSelfcheck } = require("../commands/selfcheck");
const { sendUsersList } = require("../commands/users");
const { commandExists } = require("../services/zipBuilder");
const { config } = require("../config");

function registerOwnerPanelActions(bot) {
  bot.action("owner_oauth_status", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    return sendOAuthStatus(ctx, true);
  });

  bot.action("owner_selfcheck", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    return sendSelfcheck(ctx);
  });

  bot.action("owner_users", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    return sendUsersList(ctx);
  });

  bot.action("owner_zipstatus", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");
    return ctx.reply("📦 ZIP feature: " + (commandExists("zip") ? "✅ ready" : "❌ zip tidak tersedia") + "\nPath: " + config.releaseDir);
  });
}

module.exports = { registerOwnerPanelActions };

