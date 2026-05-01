const express = require("express");
const { exchangeCodeAndSaveToken } = require("./services/oauth");

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

  // ===== START OAUTH (buat test manual) =====
  app.get("/auth/google", (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).send("❌ Google OAuth env belum lengkap.");
    }

    const base = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive",
      access_type: "offline",
      prompt: "consent",
      state: "test-user" // nanti ganti userId dari bot
    });

    res.redirect(`${base}?${params.toString()}`);
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
              <p>Token tersimpan. Balik ke Telegram.</p>
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

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Server running on port", PORT);
  });
}

module.exports = { startServer };
