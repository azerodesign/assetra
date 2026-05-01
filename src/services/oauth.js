const { google } = require("googleapis");

// simpan sementara di memory (biar gak crash). Nanti pindah ke DB.
const tokenStore = new Map();

async function exchangeCodeAndSaveToken(code, state) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth env belum lengkap");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  // simpan by state (nanti ganti userId)
  tokenStore.set(state, tokens);

  return tokens;
}

module.exports = { exchangeCodeAndSaveToken };
