const { isOwner } = require("../storage/roleStore");
const { clearJob } = require("../storage/renameJobStore");
const { clearFlow } = require("../storage/flowStore");
const { mainInlineKeyboard } = require("../ui/keyboards");
const { text } = require("../ui/text");
const { editHtml } = require("../ui/send");

function registerFlowActions(bot) {
  bot.action("cancel_flow", async (ctx) => {
    await ctx.answerCbQuery("Dibatalkan.").catch(() => {});
    const uid = String(ctx.from.id);
    clearJob(uid);
    clearFlow(uid);

    return editHtml(ctx, text.home(), mainInlineKeyboard(isOwner(uid)));
  });
}

module.exports = { registerFlowActions };

