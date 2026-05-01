const express = require("express");
const { exchangeCodeAndSaveToken } = require("./services/oauth");
const { logger } = require("./services/logger");

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function startServer() {
  const app = express();

  // ===== HEALTH CHECK =====
  app.get("/", (req, res) => {
    res.send("Assetra OK 🚀");
  });

  // ===== OAUTH CALLBACK =====
  app.get("/oauth2callback", async (req, res) => {
    try {
      const code = req.query.code;
      const state = req.query.state;

      if (!code) return res.status(400).send("❌ Kode OAuth tidak ada.");
      if (!state) return res.status(400).send("❌ State kosong.");

      await exchangeCodeAndSaveToken(String(code), String(state));

      return res.send(`
        <html>
          <body style="font-family:system-ui;background:#0f172a;color:#e5e7eb;display:grid;place-items:center;min-height:100vh;">
            <main style="max-width:520px;padding:32px;border-radius:24px;background:#111827;text-align:center;">
              <h1>✅ Google Drive Terhubung</h1>
              <p>Kembali ke Telegram → cek <b>Auth Status</b>.</p>
            </main>
          </body>
        </html>
      `);
    } catch (err) {
      logger.error("OAuth callback failed:", err?.message || err);
      return res
        .status(500)
        .send("❌ OAuth error: " + escapeHtml(err?.message || "unknown"));
    }
  });

  const PORT = process.env.PORT || 3000;

  // IMPORTANT: bind 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Assetra server running on port", PORT);
  });
}

module.exports = { startServer };
