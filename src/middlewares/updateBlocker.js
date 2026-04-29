const { config } = require("../config");
const { isOwner } = require("../storage/roleStore");
const { loadUpdateState, saveUpdateState } = require("../storage/updateStore");
const { userLabel } = require("../utils/format");

async function updateBlocker(ctx, next) {
  const uid = String(ctx.from?.id || "");
  const text = ctx.message?.text || "";
  const action = ctx.callbackQuery?.data || "";

  const bypassCommands = [
    "/selfcheck", "/roles", "/addrole", "/removerole", "/update_on", "/update_off",
    "/update_status", "/broadcast", "/oauthcheck", "/status", "/myid",
  ];

  const bypassActions = ["request_access", "owner_oauth_status", "owner_selfcheck", "owner_users", "owner_zipstatus"];

  if (isOwner(uid)) return next();
  if (bypassCommands.some((cmd) => text.startsWith(cmd))) return next();
  if (bypassActions.includes(action)) return next();

  const state = loadUpdateState();
  if (!state.active) return next();

  await ctx.reply(state.message || "⚙️ Bot sedang update sebentar.").catch(() => {});

  const now = Date.now();
  const last = (state.lastNotice || {})[uid] || 0;

  if (config.ownerId && now - last > 60000) {
    state.lastNotice = { ...(state.lastNotice || {}), [uid]: now };
    saveUpdateState(state);

    ctx.telegram
      .sendMessage(config.ownerId, [
        "⚠️ User coba akses saat update mode",
        "User: " + userLabel(ctx.from) + " (" + uid + ")",
        "Pesan: " + (text || action || "-"),
      ].join("\n"))
      .catch(() => {});
  }
}

module.exports = { updateBlocker };

