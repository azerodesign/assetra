const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const childProcess = require("child_process");
const { config } = require("../config");
const { ensureDir, copyFileIfExists } = require("../utils/fs");

function commandExists(cmd) {
  try {
    childProcess.execFileSync("which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function copyDataFolder(dest, options = {}) {
  if (!fs.existsSync(config.dataDir)) return;
  ensureDir(dest);

  const exclude = new Set(options.exclude || []);

  for (const file of fs.readdirSync(config.dataDir)) {
    if (exclude.has(file)) continue;
    const src = path.join(config.dataDir, file);
    const target = path.join(dest, file);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, target);
  }
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function buildPanelZip() {
  if (!commandExists("zip")) throw new Error("Command zip tidak tersedia di server.");

  const ts = Date.now();
  const buildName = "assetra-v" + config.version + "-panel-" + ts;
  const buildDir = path.join(config.releaseDir, buildName);
  const zipPath = path.join(config.releaseDir, buildName + ".zip");

  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.rmSync(zipPath, { force: true });
  ensureDir(buildDir);

  copyFileIfExists(path.join(config.rootDir, "index.js"), path.join(buildDir, "index.js"));
  copyFileIfExists(path.join(config.rootDir, "package.json"), path.join(buildDir, "package.json"));
  copyFileIfExists(path.join(config.rootDir, "package-lock.json"), path.join(buildDir, "package-lock.json"));

  if (fs.existsSync(path.join(config.rootDir, "src"))) {
    fs.cpSync(path.join(config.rootDir, "src"), path.join(buildDir, "src"), { recursive: true });
  }

  fs.writeFileSync(path.join(buildDir, ".env.example"), [
    "BOT_TOKEN=",
    "OWNER_ID=",
    "PORT=3000",
    "GOOGLE_CLIENT_ID=",
    "GOOGLE_CLIENT_SECRET=",
    "GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback",
    "ENCRYPTION_KEY=change-this-to-a-long-random-secret",
    "",
  ].join("\n"));

  copyDataFolder(path.join(buildDir, "data"), { exclude: ["google-token.enc", "bot.log"] });

  childProcess.execFileSync("zip", ["-r", zipPath, buildName], { cwd: config.releaseDir, stdio: "ignore" });

  const hash = sha256(zipPath);
  fs.writeFileSync(zipPath + ".sha256", hash + "  " + buildName + ".zip\n");

  return { buildName, zipPath, hash };
}

function buildPrivateZip(password) {
  if (!commandExists("zip")) throw new Error("Command zip tidak tersedia di server.");

  const ts = Date.now();
  const buildName = "assetra-v" + config.version + "-private-" + ts;
  const buildDir = path.join(config.releaseDir, buildName);
  const zipPath = path.join(config.releaseDir, buildName + ".zip");

  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.rmSync(zipPath, { force: true });
  ensureDir(buildDir);

  ["index.js", "package.json", "package-lock.json", ".env"].forEach((file) => {
    copyFileIfExists(path.join(config.rootDir, file), path.join(buildDir, file));
  });

  if (fs.existsSync(path.join(config.rootDir, "src"))) {
    fs.cpSync(path.join(config.rootDir, "src"), path.join(buildDir, "src"), { recursive: true });
  }

  copyDataFolder(path.join(buildDir, "data"));

  childProcess.execFileSync("zip", ["-r", "-P", password, zipPath, buildName], {
    cwd: config.releaseDir,
    stdio: "ignore",
  });

  return { buildName, zipPath, hash: sha256(zipPath) };
}

function cleanZipRelease() {
  fs.rmSync(config.releaseDir, { recursive: true, force: true });
  ensureDir(config.releaseDir);
}

module.exports = { commandExists, buildPanelZip, buildPrivateZip, cleanZipRelease };

