const { isOwner } = require("../storage/roleStore");
const { mainInlineKeyboard, cancelFlowKeyboard, authRequiredKeyboard, checkingResultKeyboard } = require("../ui/keyboards");
const {
  getAuthedDrive,
  extractFolderId,
  getFolderInfo,
  collectFolderInventoryRecursive,
  collectPngRecursive,
} = require("../services/googleDrive");
const { logger } = require("../services/logger");
const { verifyOAuthToken } = require("../services/oauth");
const { text, esc } = require("../ui/text");
const { replyHtml } = require("../ui/send");
const { saveCheckingResult } = require("../storage/checkingStore");

async function ensureDriveAuth(ctx) {
  const uid = String(ctx.from.id);
  const result = await verifyOAuthToken(uid);

  if (result.ok) return true;

  await replyHtml(ctx, text.authRequired(result), authRequiredKeyboard());
  return false;
}

async function runChecking(ctx, folderId) {
  const uid = String(ctx.from.id);
  const drive = await getAuthedDrive(uid);

  const folder = await getFolderInfo(drive, folderId);
  const inventory = await collectFolderInventoryRecursive(drive, folderId);

  saveCheckingResult(uid, { folder, inventory });

  if (!inventory.files.length && !inventory.folders.length) {
    return replyHtml(ctx, text.checkingEmpty(), mainInlineKeyboard(isOwner(uid)));
  }

  return replyHtml(ctx, text.checkingReport(folder, inventory), checkingResultKeyboard());
}

function registerDriveCommands(bot) {
  bot.command("checking", async (ctx) => {
    if (!(await ensureDriveAuth(ctx))) return;

    const body = ctx.message.text.replace(/^\/checking\s*/i, "").trim();
    if (!body) return replyHtml(ctx, text.checkingPrompt(), cancelFlowKeyboard());

    const folderId = extractFolderId(body);
    if (!folderId) return replyHtml(ctx, text.checkingInvalidLink());

    try {
      await ctx.reply(text.checkingStarted());
      await runChecking(ctx, folderId);
    } catch (err) {
      logger.error("Checking failed:", err.message);
      return replyHtml(ctx, "❌ Gagal checking: " + esc(err.message));
    }
  });

  bot.command("count", async (ctx) => {
    if (!(await ensureDriveAuth(ctx))) return;

    const body = ctx.message.text.replace(/^\/count\s*/i, "").trim();
    const folderId = extractFolderId(body);
    if (!folderId) return replyHtml(ctx, "Format: `/count <link_folder>`");

    try {
      await ctx.reply("🧮 Menghitung PNG recursive...");
      const drive = await getAuthedDrive(String(ctx.from.id));
      const files = await collectPngRecursive(drive, folderId);
      return replyHtml(ctx, "✅ Total PNG: *" + files.length + "*", mainInlineKeyboard(isOwner(String(ctx.from.id))));
    } catch (err) {
      logger.error("Count failed:", err.message);
      return replyHtml(ctx, "❌ Error count: " + esc(err.message));
    }
  });
}

module.exports = { registerDriveCommands, runChecking, ensureDriveAuth };

