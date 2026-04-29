const { loadCheckingResult } = require("../storage/checkingStore");
const { fileListKeyboard, checkingResultKeyboard } = require("../ui/keyboards");
const { text } = require("../ui/text");
const { editHtml } = require("../ui/send");
const { logger } = require("../services/logger");

const PER_PAGE = 10;

function getTotalPages(result) {
  const files = result?.inventory?.files || [];
  return Math.max(1, Math.ceil(files.length / PER_PAGE));
}

function registerCheckingActions(bot) {
  bot.action(/^checking_file_list:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const uid = String(ctx.from.id);
    const result = loadCheckingResult(uid);

    if (!result) {
      return editHtml(ctx, "📭 Belum ada hasil checking. Klik 🔎 Cek Folder dulu.");
    }

    const page = Number(ctx.match[1] || 1);
    const totalPages = getTotalPages(result);

    try {
      return editHtml(ctx, text.fileListPage(result, page, PER_PAGE), fileListKeyboard(page, totalPages));
    } catch (err) {
      logger.error("File list render failed:", err.message);
      return editHtml(ctx, "❌ Gagal render file list: " + String(err.message || err));
    }
  });

  bot.action("checking_summary", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const uid = String(ctx.from.id);
    const result = loadCheckingResult(uid);

    if (!result) {
      return editHtml(ctx, "📭 Belum ada hasil checking. Klik 🔎 Cek Folder dulu.");
    }

    try {
      return editHtml(ctx, text.checkingReport(result.folder, result.inventory), checkingResultKeyboard());
    } catch (err) {
      logger.error("Checking summary render failed:", err.message);
      return editHtml(ctx, "❌ Gagal render summary: " + String(err.message || err));
    }
  });

  bot.action("noop", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
  });
}

module.exports = { registerCheckingActions };

