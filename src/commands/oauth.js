const { Markup } = require("telegraf");
const { generateAuthUrl, verifyOAuthToken } = require("../services/oauth");
const { mainInlineKeyboard, authStatusKeyboard, reauthConfirmKeyboard } = require("../ui/keyboards");
const { isOwner } = require("../storage/roleStore");
const { text } = require("../ui/text");
const { replyHtml, editHtml } = require("../ui/send");

async function sendOAuthStatus(ctx, editable = false) {
  const uid = String(ctx.from?.id || "");
  const result = await verifyOAuthToken(uid);
  const body = text.authStatus(result);
  const keyboard = editable ? authStatusKeyboard() : mainInlineKeyboard(isOwner(uid));

  if (editable) return editHtml(ctx, body, keyboard);
  return replyHtml(ctx, body, keyboard);
}

async function sendAuthLink(ctx, editable = false, force = false) {
  try {
    const uid = String(ctx.from.id);

    if (!force) {
      const status = await verifyOAuthToken(uid);

      if (status.ok) {
        const body = text.authAlreadyConnected(status);
        const keyboard = reauthConfirmKeyboard();

        if (editable) return editHtml(ctx, body, keyboard);
        return replyHtml(ctx, body, keyboard);
      }
    }

    const url = generateAuthUrl(uid);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.url("🔗 Login Google Drive", url)],
      [Markup.button.callback("📊 Cek Status", "menu_auth_status")],
      [Markup.button.callback("⬅️ Back", "menu_home")],
    ]);

    if (editable) return editHtml(ctx, text.authLink(), keyboard);
    return replyHtml(ctx, text.authLink(), keyboard);
  } catch (err) {
    const body = text.authError(err.message);
    if (editable) return editHtml(ctx, body, authStatusKeyboard());
    return replyHtml(ctx, body);
  }
}

function registerOAuthCommands(bot) {
  bot.command("auth", async (ctx) => sendAuthLink(ctx, false, false));
  bot.command("reauth", async (ctx) => sendAuthLink(ctx, false, true));
  bot.command("oauthcheck", async (ctx) => sendOAuthStatus(ctx, false));
  bot.command("status", async (ctx) => sendOAuthStatus(ctx, false));
}

module.exports = { registerOAuthCommands, sendOAuthStatus, sendAuthLink };

