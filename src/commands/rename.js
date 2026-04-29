const { isOwner } = require("../storage/roleStore");
const { mainInlineKeyboard, cancelFlowKeyboard, authRequiredKeyboard } = require("../ui/keyboards");
const { sanitizeBaseName } = require("../utils/security");
const { extractFolderId, getAuthedDrive, collectPngRecursive, renameDriveFile } = require("../services/googleDrive");
const { loadJob, saveJob, clearJob } = require("../storage/renameJobStore");
const { logger } = require("../services/logger");
const { verifyOAuthToken } = require("../services/oauth");
const { text, esc } = require("../ui/text");
const { replyHtml } = require("../ui/send");

async function ensureRenameAuth(ctx) {
  const uid = String(ctx.from.id);
  const result = await verifyOAuthToken(uid);

  if (result.ok) return true;

  await replyHtml(ctx, text.authRequired(result), authRequiredKeyboard());
  return false;
}

async function prepareRenameJob(ctx, folderLink, baseNameRaw) {
  const uid = String(ctx.from.id);
  const folderId = extractFolderId(folderLink);
  const baseName = sanitizeBaseName(baseNameRaw);

  if (!folderId) return replyHtml(ctx, text.checkingInvalidLink());
  if (!baseName) return replyHtml(ctx, text.renameInvalidName());

  await ctx.reply(text.renamePreparing());

  const drive = await getAuthedDrive(uid);
  const files = await collectPngRecursive(drive, folderId);

  if (!files.length) return replyHtml(ctx, text.renameNoPng());

  saveJob(uid, { folderId, baseName, files });
  return replyHtml(ctx, text.renamePreview(files, baseName));
}

function registerRenameCommands(bot) {
  bot.command("rename", async (ctx) => {
    if (!(await ensureRenameAuth(ctx))) return;

    const raw = ctx.message.text.replace(/^\/rename\s*/i, "").trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    const folderLink = parts[0] || "";
    const baseName = parts.slice(1).join(" ");

    if (!folderLink || !baseName) {
      return replyHtml(ctx, text.renameManualHelp(), cancelFlowKeyboard());
    }

    try {
      return prepareRenameJob(ctx, folderLink, baseName);
    } catch (err) {
      logger.error("Rename prepare failed:", err.message);
      return replyHtml(ctx, "❌ Error rename: " + esc(err.message));
    }
  });

  bot.command("confirm", async (ctx) => {
    if (!(await ensureRenameAuth(ctx))) return;

    const uid = String(ctx.from.id);
    const job = loadJob(uid);

    if (!job) return replyHtml(ctx, text.renameNoJob());
    if (!Array.isArray(job.files) || !job.files.length) {
      clearJob(uid);
      return replyHtml(ctx, text.renameJobEmpty());
    }

    try {
      const drive = await getAuthedDrive(uid);
      let ok = 0;
      let fail = 0;

      await ctx.reply(text.renameStarted(job.files.length));

      for (let i = 0; i < job.files.length; i++) {
        const newName = job.baseName + "-" + String(i + 1).padStart(3, "0") + ".png";
        try {
          await renameDriveFile(drive, job.files[i].id, newName);
          ok++;
        } catch (err) {
          fail++;
          logger.error("Rename gagal: " + job.files[i].name + " -> " + newName + ":", err.message);
        }

        if ((i + 1) % 50 === 0) await ctx.reply(text.renameProgress(i + 1, job.files.length));
      }

      clearJob(uid);
      return replyHtml(ctx, text.renameDone(ok, fail), mainInlineKeyboard(isOwner(uid)));
    } catch (err) {
      logger.error("Confirm rename failed:", err.message);
      return replyHtml(ctx, "❌ Gagal rename: " + esc(err.message));
    }
  });

  bot.command("cancel", async (ctx) => {
    clearJob(String(ctx.from.id));
    return replyHtml(ctx, text.jobCancelled(), mainInlineKeyboard(isOwner(String(ctx.from.id))));
  });
}

module.exports = { registerRenameCommands, prepareRenameJob, ensureRenameAuth };

