const { isOwner } = require("../storage/roleStore");
const {
  mainInlineKeyboard,
  ownerInlineKeyboard,
  cancelFlowKeyboard,
  authRequiredKeyboard,
  backHomeKeyboard,
} = require("../ui/keyboards");
const { sendOAuthStatus, sendAuthLink } = require("../commands/oauth");
const { sendSelfcheck } = require("../commands/selfcheck");
const { sendUsersList } = require("../commands/users");
const { setFlow, clearFlow } = require("../storage/flowStore");
const { verifyOAuthToken } = require("../services/oauth");
const { text } = require("../ui/text");
const { replyHtml, editHtml } = require("../ui/send");

async function ensureUserAuthed(ctx) {
  const uid = String(ctx.from.id);
  const result = await verifyOAuthToken(uid);

  if (result.ok) return true;

  await editHtml(ctx, text.authRequired(result), authRequiredKeyboard());
  return false;
}

function registerMenuActions(bot) {
  bot.action("menu_home", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    clearFlow(String(ctx.from.id));
    return editHtml(ctx, text.home(), mainInlineKeyboard(isOwner(String(ctx.from.id))));
  });

  bot.action("menu_auth", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    return sendAuthLink(ctx, true, false);
  });

  bot.action("menu_reauth_confirm", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    return sendAuthLink(ctx, true, true);
  });

  bot.action("menu_checking", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const uid = String(ctx.from.id);

    if (!(await ensureUserAuthed(ctx))) return;

    setFlow(uid, { type: "checking", step: "await_folder_link" });
    return editHtml(ctx, text.checkingPrompt(), cancelFlowKeyboard());
  });

  bot.action("menu_rename", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const uid = String(ctx.from.id);

    if (!(await ensureUserAuthed(ctx))) return;

    setFlow(uid, { type: "rename", step: "await_folder_link" });
    return editHtml(ctx, text.renameStep1(), cancelFlowKeyboard());
  });

  bot.action("menu_auth_status", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    return sendOAuthStatus(ctx, true);
  });

  bot.action("menu_help", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const owner = isOwner(String(ctx.from.id));
    return editHtml(ctx, text.help(owner), backHomeKeyboard());
  });

  bot.action("menu_owner_panel", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return editHtml(ctx, text.ownerPanel(), ownerInlineKeyboard());
  });

  bot.action("owner_auth", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    return sendAuthLink(ctx, true, false);
  });

  bot.action("owner_zip_tools", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return editHtml(ctx, text.zipTools(), ownerInlineKeyboard());
  });

  bot.action("owner_update_help", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return editHtml(ctx, text.updateHelp(), ownerInlineKeyboard());
  });

  bot.action("owner_broadcast_help", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return editHtml(ctx, text.broadcastHelp(), ownerInlineKeyboard());
  });

  bot.action("owner_selfcheck", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return sendSelfcheck(ctx);
  });

  bot.action("owner_users", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!isOwner(String(ctx.from.id))) return editHtml(ctx, text.ownerOnly(), mainInlineKeyboard(false));
    return sendUsersList(ctx);
  });
}

module.exports = { registerMenuActions, ensureUserAuthed };

