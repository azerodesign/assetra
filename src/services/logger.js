const fs = require("fs");
const { config } = require("../config");
const { ensureDir } = require("../utils/fs");

function normalize(item) {
  if (typeof item === "string") return item;
  if (item instanceof Error) return item.message + "\n" + (item.stack || "");
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
}

function logToFile(level, args) {
  try {
    ensureDir(config.dataDir);
    const msg = args.map(normalize).join(" ");
    fs.appendFileSync(config.files.log, "[" + new Date().toISOString() + "] [" + level + "] " + msg + "\n");
  } catch {}
}

const rawLog = console.log;
const rawError = console.error;
const rawWarn = console.warn;

const logger = {
  info: (...args) => {
    logToFile("INFO", args);
    rawLog(...args);
  },
  warn: (...args) => {
    logToFile("WARN", args);
    rawWarn(...args);
  },
  error: (...args) => {
    logToFile("ERROR", args);
    rawError(...args);
  },
};

console.log = logger.info;
console.warn = logger.warn;
console.error = logger.error;

module.exports = { logger };

