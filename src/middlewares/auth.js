const { loadAllowedUsers } = require("../storage/userStore");
const { isOwner } = require("../storage/roleStore");
const { accessRequestKeyboard } = require("../ui/keyboards");

async function authMiddleware(ctx, next) {
  const uid = String(ctx.from?.id || "");
  const action = ctx.callbackQuery?.data || "";

  if (action === "request_access") return next();
  if (isOwner(uid) || loadAllowedUsers().includes(uid)) return next();

  if (ctx.callbackQuery) {
    await ctx.answerCbQuery("Bot private. Minta akses dulu ya.", { show_alert: true }).catch(() => {});
    return;
  }

  return ctx.reply("🔐 Bot ini private.\n\nKlik tombol di bawah buat minta akses ke owner.", accessRequestKeyboard());
}

module.exports = { authMiddleware };

