const { Telegraf } = require("telegraf");
const { config } = require("./config");
const { initializeStorage } = require("./storage/initStorage");
const { logger } = require("./services/logger");

const { authMiddleware } = require("./middlewares/auth");
const { updateBlocker } = require("./middlewares/updateBlocker");

const { registerStartCommands } = require("./commands/start");
const { registerOAuthCommands } = require("./commands/oauth");
const { registerDriveCommands } = require("./commands/drive");
const { registerRenameCommands } = require("./commands/rename");
const { registerUserCommands } = require("./commands/users");
const { registerRoleCommands } = require("./commands/roles");
const { registerSelfcheckCommands } = require("./commands/selfcheck");
const { registerUpdateModeCommands } = require("./commands/updateMode");
const { registerBroadcastCommands } = require("./commands/broadcast");
const { registerZipCommands } = require("./commands/zip");
const { registerTextMenu } = require("./commands/textMenu");

const { registerAccessActions } = require("./actions/access");
const { registerOwnerPanelActions } = require("./actions/ownerPanel");
const { registerFlowActions } = require("./actions/flow");
const { registerCheckingActions } = require("./actions/checking");
const { registerMenuActions } = require("./actions/menu");

function createBot() {
  initializeStorage();

  const bot = new Telegraf(config.botToken);

  bot.use(authMiddleware);
  bot.use(updateBlocker);

  registerStartCommands(bot);
  registerOAuthCommands(bot);
  registerDriveCommands(bot);
  registerRenameCommands(bot);
  registerUserCommands(bot);
  registerRoleCommands(bot);
  registerSelfcheckCommands(bot);
  registerUpdateModeCommands(bot);
  registerBroadcastCommands(bot);
  registerZipCommands(bot);

  registerAccessActions(bot);
  registerOwnerPanelActions(bot);
  registerFlowActions(bot);
  registerCheckingActions(bot);
  registerMenuActions(bot);

  registerTextMenu(bot);

  bot.catch((err, ctx) => {
    logger.error("Bot error:", err);
    try {
      ctx.reply("❌ Terjadi error internal. Coba lagi atau hubungi owner.");
    } catch {}
  });

  return bot;
}

module.exports = { createBot };

