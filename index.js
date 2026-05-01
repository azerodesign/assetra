require("dotenv").config();

const { startServer } = require("./src/server");
const { createBot } = require("./src/bot");

// 1) BUKA PORT DULU (WAJIB BUAT RAILWAY)
startServer();

// 2) BOT OPTIONAL (JANGAN SAMPAI CRASH KILL SERVER)
(async () => {
  try {
    if (!process.env.BOT_TOKEN) {
      console.warn("⚠️ BOT_TOKEN belum ada, skip bot.");
      return;
    }
    const bot = createBot();
    await bot.launch();
    console.log("🤖 Bot running");
  } catch (e) {
    console.error("Bot failed:", e.message);
    // jangan process.exit()
  }
})();

// graceful shutdown (opsional)
process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));
