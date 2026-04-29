const { isOwner } = require("../storage/roleStore");
const { mainInlineKeyboard, cancelFlowKeyboard, authRequiredKeyboard } = require("../ui/keyboards");
const { sendOAuthStatus, sendAuthLink } = require("./oauth");
const { sendSelfcheck } = require("./selfcheck");
const { sendUsersList } = require("./users");
const { getFlow, setFlow, clearFlow } = require("../storage/flowStore");
const { extractFolderId } = require("../services/googleDrive");
const { runChecking } = require("./drive");
const { prepareRenameJob } = require("./rename");
const { logger } = require("../services/logger");
const { verifyOAuthToken } = require("../services/oauth");
const { text, esc } = require("../ui/text");
const { replyHtml } = require("../ui/send");

async function ensureAuthedFromText(ctx) {
  const uid = String(ctx.from.id);
  const result = await verifyOAuthToken(uid);

  if (result.ok) return true;

  await replyHtml(ctx, text.authRequired(result), authRequiredKeyboard());
  return false;
}

async function handleActiveFlow(ctx, body) {
  const uid = String(ctx.from.id);
  const flow = getFlow(uid);
  if (!flow) return false;

  if (body === "❌ Batal" || body.toLowerCase() === "batal") {
    clearFlow(uid);
    await replyHtml(ctx, text.cancelled(), mainInlineKeyboard(isOwner(uid)));
    return true;
  }

  if (!(await ensureAuthedFromText(ctx))) return true;

  if (flow.type === "checking" && flow.step === "await_folder_link") {
    const folderId = extractFolderId(body);
    if (!folderId) {
      await replyHtml(ctx, text.checkingInvalidPaste(), cancelFlowKeyboard());
      return true;
    }

    try {
      clearFlow(uid);
      await ctx.reply(text.checkingStarted());
      await runChecking(ctx, folderId);
    } catch (err) {
      logger.error("Flow checking failed:", err.message);
      await replyHtml(ctx, "❌ Gagal checking: " + esc(err.message));
    }
    return true;
  }

  if (flow.type === "rename" && flow.step === "await_folder_link") {
    const folderId = extractFolderId(body);
    if (!folderId) {
      await replyHtml(ctx, text.checkingInvalidPaste(), cancelFlowKeyboard());
      return true;
    }

    setFlow(uid, { ...flow, step: "await_base_name", folderLink: body });
    await replyHtml(ctx, text.renameStep2(), cancelFlowKeyboard());
    return true;
  }

  if (flow.type === "rename" && flow.step === "await_base_name") {
    const baseName = body.trim();
    if (!baseName) {
      await replyHtml(ctx, text.renameEmptyName(), cancelFlowKeyboard());
      return true;
    }

    try {
      clearFlow(uid);
      await prepareRenameJob(ctx, flow.folderLink, baseName);
    } catch (err) {
      logger.error("Flow rename failed:", err.message);
      await replyHtml(ctx, "❌ Gagal prepare rename: " + esc(err.message));
    }
    return true;
  }

  clearFlow(uid);
  return false;
}

function registerTextMenu(bot) {
  bot.on("text", async (ctx) => {
    const body = String(ctx.message.text || "").trim();
    const uid = String(ctx.from.id);
    const owner = isOwner(uid);

    if (body.startsWith("/")) return;

    const handled = await handleActiveFlow(ctx, body);
    if (handled) return;

    if (body === "🔎 Check Folder") {
      if (!(await ensureAuthedFromText(ctx))) return;
      setFlow(uid, { type: "checking", step: "await_folder_link" });
      return replyHtml(ctx, text.checkingPrompt(), cancelFlowKeyboard());
    }

    if (body === "✏️ Rename Assets") {
      if (!(await ensureAuthedFromText(ctx))) return;
      setFlow(uid, { type: "rename", step: "await_folder_link" });
      return replyHtml(ctx, text.renameStep1(), cancelFlowKeyboard());
    }

    if (body === "📊 Drive Status") return sendOAuthStatus(ctx);
    if (body === "🔐 Connect Drive") return sendAuthLink(ctx);
    if (body === "🧠 Selfcheck") return sendSelfcheck(ctx);
    if (body === "👥 Users") return sendUsersList(ctx);

    if (body === "📦 Backup Tools") {
      if (!owner) return replyHtml(ctx, text.ownerOnly());
      return replyHtml(ctx, text.zipTools());
    }

    if (body === "ℹ️ Help") return replyHtml(ctx, text.help(owner), mainInlineKeyboard(owner));

    return replyHtml(ctx, text.fallback(), mainInlineKeyboard(owner));
  });
}

module.exports = { registerTextMenu };

