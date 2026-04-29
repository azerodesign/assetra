const { config } = require("../config");
const { isOwner } = require("../storage/roleStore");
const { loadMeta, saveMeta, allowUser } = require("../storage/userStore");
const { userLabel } = require("../utils/format");
const { accessDecisionKeyboard } = require("../ui/keyboards");

function registerAccessActions(bot) {
  bot.action("request_access", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const uid = String(ctx.from.id);
    const meta = loadMeta();
    meta[uid] = {
      ...(meta[uid] || {}),
      id: uid,
      name: userLabel(ctx.from),
      username: ctx.from.username || "",
      requestedAt: new Date().toISOString(),
    };
    saveMeta(meta);

    await ctx.editMessageText("✅ Permintaan akses sudah dikirim ke owner. Tunggu di-ACC ya.").catch(() => ctx.reply("✅ Permintaan akses sudah dikirim ke owner. Tunggu di-ACC ya."));

    if (config.ownerId) {
      ctx.telegram
        .sendMessage(config.ownerId, ["🔐 Access Request", "Dari: " + userLabel(ctx.from), "ID: " + uid].join("\n"), accessDecisionKeyboard(uid))
        .catch(() => {});
    }
  });

  bot.action(/^access_allow:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const uid = String(ctx.match[1]);
    allowUser(uid, { approvedAt: new Date().toISOString() });

    await ctx.editMessageText("✅ User " + uid + " diizinkan.").catch(() => {});
    ctx.telegram.sendMessage(uid, "✅ Akses kamu sudah di-ACC owner. Ketik /start").catch(() => {});
  });

  bot.action(/^access_deny:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const uid = String(ctx.match[1]);
    await ctx.editMessageText("❌ Request " + uid + " ditolak.").catch(() => {});
    ctx.telegram.sendMessage(uid, "❌ Request akses kamu ditolak owner.").catch(() => {});
  });
}

module.exports = { registerAccessActions };

