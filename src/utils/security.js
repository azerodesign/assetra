const crypto = require("crypto");
const { config } = require("../config");

function getEncryptionKey() {
  return crypto.createHash("sha256").update(String(config.encryptionKey)).digest();
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  return "v2:" + iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(encrypted) {
  const value = String(encrypted || "");

  if (value.startsWith("v2:")) {
    const [, ivHex, dataHex] = value.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(), Buffer.from(ivHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
  }

  const legacyKey = Buffer.from(String(config.encryptionKey).padEnd(32).slice(0, 32));
  const decipher = crypto.createDecipheriv("aes-256-cbc", legacyKey, Buffer.alloc(16, 0));
  return decipher.update(value, "hex", "utf8") + decipher.final("utf8");
}

function sanitizeBaseName(name) {
  return String(name || "")
    .trim()
    .replace(/\.[a-zA-Z0-9]+$/g, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 80);
}

function validZipPassword(password) {
  return /^[a-zA-Z0-9._@-]{6,64}$/.test(String(password || ""));
}

module.exports = { encrypt, decrypt, sanitizeBaseName, validZipPassword };

