const fs = require("fs");
const path = require("path");
const { isOwner } = require("../storage/roleStore");
const { mainInlineKeyboard, ownerInlineKeyboard } = require("../ui/keyboards");
const { text } = require("../ui/text");
const { replyHtml } = require("../ui/send");
const { userLabel } = require("../utils/format");

const bannerPath = path.join(process.cwd(), "assets", "assetra-banner.png");

async function sendStartBanner(ctx) {
  if (!fs.existsSync(bannerPath)) return false;

  try {
    await ctx.replyWithPhoto(
      { source: bannerPath },
      {
        caption: text.home(),
        parse_mode: "Markdown",
        disable_notification: true,
        ...mainInlineKeyboard(isOwner(String(ctx.from.id))),
      }
    );

    return true;
  } catch (err) {
    console.error("[Assetra] Failed to send start banner:", err.message);
    return false;
  }
}

function registerStartCommands(bot) {
  bot.start(async (ctx) => {
    const sent = await sendStartBanner(ctx);

    if (sent) return;

    return replyHtml(ctx, text.home(), mainInlineKeyboard(isOwner(String(ctx.from.id))));
  });

  bot.command("menu", async (ctx) => {
    return replyHtml(ctx, text.home(), mainInlineKeyboard(isOwner(String(ctx.from.id))));
  });

  bot.command("panel", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return replyHtml(ctx, text.ownerOnly());
    return replyHtml(ctx, text.ownerPanel(), ownerInlineKeyboard());
  });

  bot.command("myid", async (ctx) => {
    return replyHtml(ctx, "👤 " + userLabel(ctx.from) + "\n🆔 `" + ctx.from.id + "`");
  });

  bot.command("help", async (ctx) => {
    return replyHtml(ctx, text.help(isOwner(String(ctx.from.id))), mainInlineKeyboard(isOwner(String(ctx.from.id))));
  });
}

module.exports = { registerStartCommands };

