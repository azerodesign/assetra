const { config } = require("../config");
const { isOwner } = require("../storage/roleStore");
const { loadAllowedUsers } = require("../storage/userStore");

function registerBroadcastCommands(bot) {
  bot.command("broadcast", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const msg = ctx.message.text.replace(/^\/broadcast\s*/i, "").trim();
    if (!msg) return ctx.reply("Format: /broadcast <pesan>");

    const targets = [...new Set([config.ownerId, ...loadAllowedUsers()].filter(Boolean))];
    let ok = 0;
    let fail = 0;

    for (const target of targets) {
      try {
        await ctx.telegram.sendMessage(target, "📢 Broadcast\n\n" + msg);
        ok++;
      } catch {
        fail++;
      }
    }

    return ctx.reply("✅ Broadcast selesai.\nTerkirim: " + ok + "\nGagal: " + fail);
  });
}

module.exports = { registerBroadcastCommands };

