require("dotenv").config();

process.env.BOT_TOKEN = process.env.BOT_TOKEN || "dummy-test-token";
process.env.OWNER_ID = process.env.OWNER_ID || "0";
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "dummy-test-encryption-key";

const { text } = require("./src/ui/text");
const { sanitizeBaseName } = require("./src/utils/security");

const rawInput = process.argv.slice(2).join(" ") || "Nama Baru Asset";
const baseName = sanitizeBaseName(rawInput);

const mockFiles = [
  {
    id: "file_001",
    name: "old-file-a.png",
    size: 1200000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_001/view",
  },
  {
    id: "file_002",
    name: "old file b.png",
    size: 2400000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_002/view",
  },
  {
    id: "file_003",
    name: "logo-final.png",
    size: 880000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_003/view",
  },
  {
    id: "file_004",
    name: "asset mentah.png",
    size: 5100000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_004/view",
  },
  {
    id: "file_005",
    name: "image-001.png",
    size: 720000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_005/view",
  },
  {
    id: "file_006",
    name: "extra-file.png",
    size: 990000,
    mimeType: "image/png",
    webViewLink: "https://drive.google.com/file/d/file_006/view",
  },
];


const mockFolder = {
  id: "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  name: "Client Assets",
  ownerName: "Zero",
  ownerEmail: "zero@example.com",
  visibility: "Private",
};

const mockInventory = {
  files: mockFiles.map((file, index) => ({
    ...file,
    isPng: file.name.toLowerCase().endsWith(".png"),
    size: file.size || (index + 1) * 1024 * 1024,
  })),
  folders: [
    { name: "Raw Assets" },
    { name: "Final Export" },
    { name: "Client Preview" },
    { name: "Archive" },
  ],
  pngFiles: mockFiles,
  totalSize: mockFiles.reduce((sum, file) => sum + Number(file.size || 0), 0),
};

const mockFolderResult = {
  folder: mockFolder,
  inventory: mockInventory,
};

const mockCheckingResult = {
  folderId: "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  folderName: "Client Assets",
  name: "Client Assets",
  total: 120,
  totalFiles: 120,
  png: 81,
  pngCount: 81,
  imageCount: 81,
  folderCount: 4,
  size: 42800000,
  totalSize: 42800000,
  files: mockFiles,
  visibility: "private",
  isPublic: false,
  recursive: true,
};

const samples = {
  authAlreadyConnected: [{ message: "Google Drive sudah terhubung." }],
  authError: ["Invalid OAuth token"],
  authLink: ["https://example.com/oauth/assetra"],
  authRequired: [{ message: "Login Google Drive dulu sebelum lanjut." }],
  authStatus: [{ message: "Google Drive connected successfully." }],

  broadcastHelp: [],
  cancelled: [],
  jobCancelled: [],

  checkingEmpty: [],
  checkingInvalidLink: [],
  checkingInvalidPaste: [],
  checkingPrompt: [],
  checkingReport: [mockFolder, mockInventory],
  checkingResult: [mockFiles],
  checkingStarted: [],

  fileListPage: [mockFolderResult, 1, 5],
  folderVisibilityLabel: ["private"],
  formatBytes: [42800000],

  help: [false],
  home: [],

  ownerOnly: [],
  ownerPanel: [],

  renameDone: [81, 0],
  renameEmptyName: [],
  renameInvalidName: [],
  renameJobEmpty: [],
  renameManualHelp: [],
  renameNoJob: [],
  renameNoPng: [],
  renamePreparing: [],
  renamePreview: [mockFiles, baseName],
  renameProgress: [50, 81],
  renameStarted: [81],
  renameStep1: [],
  renameStep2: [],

  updateHelp: [],
  zipTools: [],
  fallback: [],
};

function section(title) {
  console.log("");
  console.log("====================================");
  console.log(title);
  console.log("====================================");
}

function print(title, fn, args = []) {
  section(title);

  try {
    const result = fn.apply(text, args);

    if (result === undefined) {
      console.log("⚠️ No output");
      return;
    }

    console.log(result);
  } catch (err) {
    console.log("❌ ERROR:", err.message);
    console.log("Args:", JSON.stringify(args, null, 2));
  }
}

console.log("====================================");
console.log(" ASSET-RA FULL UI PREVIEW");
console.log("====================================");
console.log("Raw input :", rawInput);
console.log("Sanitized :", baseName);
console.log("Renderer  : Current text.js output");
console.log("Note      : Telegram Markdown preview. Bot parse_mode should be Markdown.");
console.log("");

section("AVAILABLE TEXT FUNCTIONS");
console.log(Object.keys(text).sort().join("\n"));

const ordered = [
  "home",
  "help",

  "authRequired",
  "authLink",
  "authAlreadyConnected",
  "authStatus",
  "authError",

  "checkingPrompt",
  "checkingStarted",
  "checkingInvalidLink",
  "checkingInvalidPaste",
  "checkingEmpty",
  "checkingResult",
  "checkingReport",
  "fileListPage",
  "folderVisibilityLabel",
  "formatBytes",

  "renameStep1",
  "renameStep2",
  "renameManualHelp",
  "renamePreparing",
  "renameNoPng",
  "renameEmptyName",
  "renameInvalidName",
  "renamePreview",
  "renameNoJob",
  "renameJobEmpty",
  "renameStarted",
  "renameProgress",
  "renameDone",

  "zipTools",
  "updateHelp",
  "broadcastHelp",
  "ownerPanel",
  "ownerOnly",
  "cancelled",
  "jobCancelled",
  "fallback",
];

for (const name of ordered) {
  if (typeof text[name] !== "function") {
    print(name.toUpperCase(), () => "⚠️ Function not found");
    continue;
  }

  const args = Object.prototype.hasOwnProperty.call(samples, name)
    ? samples[name]
    : [];

  print(name.toUpperCase(), text[name], args);
}

section("UNTESTED FUNCTIONS");
const tested = new Set(ordered);
const untested = Object.keys(text).filter((name) => !tested.has(name));

if (!untested.length) {
  console.log("All exported text functions are included in this preview.");
} else {
  console.log(untested.sort().join("\n"));
}

console.log("");
console.log("✅ Full UI preview finished.");
