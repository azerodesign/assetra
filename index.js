require("dotenv").config();

const { createBot } = require("./src/bot");
const { startServer } = require("./src/server");
const { logger } = require("./src/services/logger");
const { config } = require("./src/config");

async function main() {
  const bot = createBot();

  await bot.launch();
  startServer();

  logger.info(`🤖 Assetra v${config.version} berjalan.`);

  process.once("SIGINT", () => {
    logger.info("SIGINT received. Stopping bot...");
    bot.stop("SIGINT");
    process.exit(0);
  });

  process.once("SIGTERM", () => {
    logger.info("SIGTERM received. Stopping bot...");
    bot.stop("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error("Startup failed:", err);
  process.exit(1);
});

