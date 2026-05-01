require("dotenv").config();

const { createBot } = require("./src/bot");
const { startServer } = require("./src/server");
const { logger } = require("./src/services/logger");
const { config } = require("./src/config");

async function main() {
  try {
    // 1) BUKA PORT DULU (penting buat Railway)
    startServer();

    // 2) Start bot
    const bot = createBot();

    // opsional: webhook kalau lu pakai webhook (kalau gak, long polling default)
    // await bot.telegram.setWebhook(process.env.WEBHOOK_URL);

    await bot.launch();

    logger.info(`🤖 Assetra v${config?.version || "0.1.0"} berjalan.`);
  } catch (err) {
    logger.error("Startup failed:", err);
    process.exit(1);
  }

  // graceful shutdown
  process.once("SIGINT", () => process.exit(0));
  process.once("SIGTERM", () => process.exit(0));
}

main();
