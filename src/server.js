const express = require("express");
const { config } = require("./config");
const { exchangeCodeAndSaveToken } = require("./services/oauth");
const { logger } = require("./services/logger");
const { escapeHtml } = require("./utils/format");

function startServer() {
  const app = express();

  app.get("/oauth2callback", async (req, res) => {
    try {
      const code = req.query.code;
      const state = req.query.state;

      if (!code) return res.status(400).send("❌ Kode OAuth tidak ada.");
      if (!state) return res.status(400).send("❌ State OAuth kosong. Ulangi /auth dari Telegram.");

      await exchangeCodeAndSaveToken(String(code), String(state));

      return res.send(`
        <html>
          <head><title>Assetra</title></head>
          <body style="font-family:system-ui;background:#0f172a;color:#e5e7eb;display:grid;place-items:center;min-height:100vh;">
            <main style="max-width:520px;padding:32px;border-radius:24px;background:#111827;box-shadow:0 20px 60px rgba(0,0,0,.35);">
              <h1>✅ Google Drive Terhubung</h1>
              <p>Token akun kamu berhasil disimpan. Silakan kembali ke Telegram dan klik <b>📊 Auth Status</b>.</p>
            </main>
          </body>
        </html>
      `);
    } catch (err) {
      logger.error("OAuth callback failed:", err.message);
      return res.status(500).send("❌ OAuth error: " + escapeHtml(err.message));
    }
  });

  app.get("/health", (_, res) => {
    res.json({ ok: true, name: "Assetra", version: config.version, uptime: Math.floor(process.uptime()) });
  });

  app.listen(config.port, () => {
    logger.info("🌐 OAuth server aktif di http://localhost:" + config.port);
  });
}

module.exports = { startServer };

