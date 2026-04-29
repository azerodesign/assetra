const { config } = require("../config");
const { isOwner } = require("../storage/roleStore");
const { loadAllowedUsers } = require("../storage/userStore");
const { loadUpdateState, saveUpdateState } = require("../storage/updateStore");
const { idDate } = require("../utils/format");

function registerUpdateModeCommands(bot) {
  bot.command("update_on", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const msg = ctx.message.text.replace(/^\/update_on\s*/i, "").trim() || "⚙️ Bot sedang update sebentar. Balik lagi nanti ya.";
    const state = loadUpdateState();
    state.active = true;
    state.message = msg;
    state.startedAt = new Date().toISOString();
    state.endedAt = null;
    state.lastNotice = {};
    saveUpdateState(state);

    const targets = [...new Set([config.ownerId, ...loadAllowedUsers()].filter(Boolean))];
    let ok = 0;
    for (const target of targets) {
      try {
        await ctx.telegram.sendMessage(target, "⚙️ Update mode aktif:\n" + msg);
        ok++;
      } catch {}
    }

    return ctx.reply("✅ Update mode aktif. Broadcast: " + ok + "/" + targets.length);
  });

  bot.command("update_off", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const msg = ctx.message.text.replace(/^\/update_off\s*/i, "").trim() || "✅ Update selesai. Bot sudah normal lagi.";
    const state = loadUpdateState();
    state.active = false;
    state.endedAt = new Date().toISOString();
    saveUpdateState(state);

    const targets = [...new Set([config.ownerId, ...loadAllowedUsers()].filter(Boolean))];
    let ok = 0;
    for (const target of targets) {
      try {
        await ctx.telegram.sendMessage(target, msg);
        ok++;
      } catch {}
    }

    return ctx.reply("✅ Update mode nonaktif. Broadcast: " + ok + "/" + targets.length);
  });

  bot.command("update_status", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const state = loadUpdateState();
    return ctx.reply([
      "⚙️ Update Status",
      "Status: " + (state.active ? "AKTIF" : "TIDAK"),
      "Pesan: " + state.message,
      "Mulai: " + idDate(state.startedAt),
      "Selesai: " + idDate(state.endedAt),
    ].join("\n"));
  });
}

module.exports = { registerUpdateModeCommands };

