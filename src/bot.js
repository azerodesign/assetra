const { Telegraf } = require("telegraf");

function createBot() {
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply("Assetra bot aktif 🚀");
  });

  return bot;
}

module.exports = { createBot };
