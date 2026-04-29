function withHtml(extra = {}) {
  return {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...extra,
  };
}

function mergeOptions(keyboard) {
  if (!keyboard) return withHtml();
  return withHtml(keyboard);
}

async function replyHtml(ctx, text, keyboard) {
  return ctx.reply(text, mergeOptions(keyboard));
}

async function editHtml(ctx, text, keyboard) {
  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, mergeOptions(keyboard))
      .catch(() => ctx.reply(text, mergeOptions(keyboard)));
  }

  return ctx.reply(text, mergeOptions(keyboard));
}

module.exports = { withHtml, replyHtml, editHtml };

