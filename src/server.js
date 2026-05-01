const express = require("express");
require("dotenv").config();

const { exchangeCodeAndSaveToken } = require("./services/oauth");
const { logger } = require("./services/logger");

// fallback kalau utils belum ada
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function startServer() {
  const app = express();

  // ===== HEALTH CHECK (WAJIB BUAT RAILWAY) =====
  app.get("/", (req, res) => {
    res.send("Assetra OK 🚀");
  });

  // ===== OAUTH CALLBACK =====
  app.get("/oauth2callback", async (req, res) => {
    try {
      const code = req.query.code;
      const state = req.query.state;

      if (!code) {
        return res.status(400).send("❌ Kode OAuth tidak ada.");
      }

      if (!state) {
        return res
          .status(400)
          .send("❌ State kosong. Ulangi login dari bot.");
      }

      await exchangeCodeAndSaveToken(String(code), String(state));

      return res.send(`
        <html>
          <head>
            <title>Assetra Connected</title>
          </head>
          <body style="font-family:system-ui;background:#0f172a;color:#e5e7eb;display:grid;place-items:center;min-height:100vh;">
            <main style="max-width:520px;padding:32px;border-radius:24px;background:#111827;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center;">
              <h1>✅ Google Drive Terhubung</h1>
              <p>Token berhasil disimpan.</p>
              <p>Balik ke Telegram dan klik <b>Auth Status</b>.</p>
            </main>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("OAuth Error:", err);
      return res
        .status(500)
        .send("❌ OAuth error: " + escapeHtml(err.message));
    }
  });

  // ===== START SERVER =====
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Assetra running on port", PORT);
  });
}

// ===== START APP =====
startServer();
