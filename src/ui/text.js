const { config } = require("../config");

function esc(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\`/g, "\\\`");
}

function code(value = "") {
  return "`" + String(value).replace(/\\/g, "\\\\").replace(/\`/g, "\\\`") + "`";
}

function bold(value = "") {
  return "*" + esc(value) + "*";
}

function page(title, lines = []) {
  return [
    title,
    "━━━━━━━━━━━━━━",
    ...lines,
  ].join("\n");
}

function fileListSample(files = [], limit = 5) {
  const shown = files.slice(0, limit);
  return shown.map((file, index) => (index + 1) + ". " + esc(file.name || "unnamed")).join("\n");
}

const text = {
  home() {
    return page("📦 *Welcome to Assetra*", [
      "",
      "🗂 Kelola asset Google Drive langsung dari Telegram.",
      "",
      "⚡ Scan folder, cek report, rename asset massal, dan backup ZIP dalam beberapa klik.",
      "",
      "🚀 *Mulai:*",
      "1. 🔐 Connect Drive",
      "2. 🔗 Kirim link folder",
      "3. ✨ Pilih action",
    ]);
  },

  help(isOwnerUser = false) {
    const lines = [
      "",
      "*Start here:*",
      "• 🔐 Connect Drive — hubungkan akun Google Drive",
      "• 🔎 Check Folder — scan dan lihat report folder",
      "• ✏️ Rename Assets — preview dulu, confirm belakangan",
      "",
      "*Manual commands:*",
      "• " + code("/checking <folder_link>"),
      "• " + code("/count <folder_link>"),
      "• " + code("/rename <folder_link> <name>"),
      "• " + code("/confirm"),
      "• " + code("/cancel"),
      "• " + code("/myid"),
      "• " + code("/status"),
    ];

    if (isOwnerUser) {
      lines.push(
        "",
        "*Owner commands:*",
        "• " + code("/allow <id>"),
        "• " + code("/revoke <id>"),
        "• " + code("/users"),
        "• " + code("/roles"),
        "• " + code("/addrole <id> <role>"),
        "• " + code("/removerole <id>"),
        "• " + code("/update_on <pesan>"),
        "• " + code("/update_off <pesan>"),
        "• " + code("/broadcast <pesan>"),
        "• " + code("/selfcheck"),
        "• " + code("/panelzip"),
        "• " + code("/privatezip <password>"),
        "• " + code("/cleanzip")
      );
    }

    return page("📚 *Assetra Guide*", lines);
  },

  authStatus(result) {
    return page("🔐 *OAuth Status*", [
      "",
      esc(result.message),
    ]);
  },

  authLink() {
    return page("🔐 *Connect Google Drive*", [
      "",
      "Login pakai akun Google Drive yang mau kamu pakai buat checking/rename.",
      "",
      "Klik tombol login di bawah ini.",
      "",
      "Setelah berhasil, balik ke bot lalu klik *📊 Auth Status*.",
    ]);
  },

  authAlreadyConnected(result) {
    return page("✅ *Google Drive Connected*", [
      "",
      "Akun Telegram ini sudah terhubung ke Google Drive.",
      "",
      "*Status:*",
      esc(result.message),
      "",
      "Mau login ulang atau ganti akun Drive?",
    ]);
  },

  authError(message) {
    return page("❌ *Auth Error*", [
      "",
      esc(message),
    ]);
  },

  authRequired(result) {
    return page("⚠️ *Connect Google Drive First*", [
      "",
      "Fitur Drive butuh akun Google kamu:",
      "• 🔎 Cek Folder",
      "• ✏️ Rename Assets",
      "",
      "Klik *Auth Google* dulu, login, lalu balik lagi ke bot.",
      "",
      "*Current status:*",
      esc(result.message),
    ]);
  },

  checkingPrompt() {
    return page("🔎 *Check Folder*", [
      "",
      "*Step 1/1*",
      "Kirim link folder Google Drive yang mau kamu scan.",
      "",
      "*Example:*",
      code("https://drive.google.com/drive/folders/xxxx"),
    ]);
  },

  checkingStarted() {
    return "🔍 Scanning folder and subfolders...";
  },

  checkingInvalidLink() {
    return "❌ Link tidak valid. Kirim link folder Google Drive, bukan link file.";
  },

  checkingInvalidPaste() {
    return "❌ Itu belum kebaca sebagai folder Drive. Kirim link folder Google Drive yang valid.";
  },

  checkingEmpty() {
    return page("📭 *No Assets Found*", [
      "",
      "Tidak ada file PNG di folder ini, termasuk subfoldernya.",
    ]);
  },

  checkingResult(files = []) {
    const extra = files.length > 5 ? "...dan " + (files.length - 5) + " file lainnya." : "";
    return page("✅ *Folder Scan Complete*", [
      "",
      "Found *" + files.length + "* PNG files.",
      "",
      "*Sample files:*",
      fileListSample(files),
      extra ? esc(extra) : "",
      "",
      "Ready to rename? Tap *✏️ Rename Assets* from the menu.",
    ].filter(Boolean));
  },


  formatBytes(bytes = 0) {
    const value = Number(bytes || 0);
    if (!value) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value;
    let index = 0;

    while (size >= 1024 && index < units.length - 1) {
      size = size / 1024;
      index++;
    }

    const fixed = size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1);
    return fixed + " " + units[index];
  },

  folderVisibilityLabel(visibility = "") {
    if (visibility === "Public Link") return "🌍 Public via Link";
    if (visibility === "Public Searchable") return "🌐 Public Searchable";
    return "🔒 Private / Restricted";
  },

  checkingReport(folder = {}, inventory = {}) {
    const totalFiles = (inventory.files || []).length;
    const totalFolders = (inventory.folders || []).length;
    const totalPng = (inventory.pngFiles || []).length;
    const totalSize = this.formatBytes(inventory.totalSize || 0);

    return page("📊 *Folder Report*", [
      "",
      "*Folder:*",
      esc(folder.name || "Unknown Folder"),
      "",
      "*Owner:*",
      esc(folder.ownerName || "Unknown") + (folder.ownerEmail ? " (" + esc(folder.ownerEmail) + ")" : ""),
      "",
      "*Status:*",
      this.folderVisibilityLabel(folder.visibility),
      "",
      "*Summary:*",
      "• Total files: *" + totalFiles + "*",
      "• Total folder: *" + totalFolders + "*",
      "• PNG file: *" + totalPng + "*",
      "• Total size: *" + totalSize + "*",
      "",
      "Tap *📄 File List* to review the files.",
    ]);
  },

  fileListPage(result = {}, pageNumber = 1, perPage = 10) {
    const files = result?.inventory?.files || [];
    const folderName = result?.folder?.name || "Folder";
    const totalPages = Math.max(1, Math.ceil(files.length / perPage));
    const currentPage = Math.min(Math.max(1, Number(pageNumber || 1)), totalPages);
    const start = (currentPage - 1) * perPage;
    const list = files.slice(start, start + perPage);

    const lines = list.map((file, index) => {
      const no = start + index + 1;
      const icon = file.isPng ? "🖼" : "📄";
      const size = this.formatBytes(file.size || 0);
      return no + ". " + icon + " " + esc(file.name || "unnamed") + " — " + esc(size);
    });

    return page("📄 *File List*", [
      "",
      "*Folder:* " + esc(folderName),
      "*Total:* " + files.length + " file",
      "*Page:* " + currentPage + "/" + totalPages,
      "",
      ...(lines.length ? lines : ["Tidak ada file."]),
    ]);
  },

  renameStep1() {
    return page("✏️ *Rename Assets*", [
      "",
      "*Step 1/2*",
      "Kirim link folder Drive yang berisi asset yang mau direname.",
    ]);
  },

  renameStep2() {
    return page("✏️ *Rename Assets*", [
      "",
      "*Step 2/2*",
      "Sekarang ketik nama dasar untuk file baru.",
      "",
      "*Example:*",
      code("Asset Pack"),
      "",
      "*Result format:*",
      code("Asset-Pack-001.png"),
      code("Asset-Pack-002.png"),
    ]);
  },

  renameManualHelp() {
    return page("✏️ *Rename Assets*", [
      "",
      "*Simple flow:*",
      "1. Tap ✏️ Rename Assets",
      "2. Send folder link",
      "3. Type the new base name",
      "4. Preview, then confirm",
    ]);
  },

  renamePreparing() {
    return "📦 Preparing rename preview...";
  },

  renameNoPng() {
    return "📭 No PNG files available to rename.";
  },

  renameEmptyName() {
    return "❌ Name cannot be empty. Type a base name for the new files.";
  },

  renameInvalidName() {
    return "❌ New name is empty.";
  },

  renamePreview(files = [], baseName = "") {
    const preview = files.slice(0, 5)
      .map((file, index) => esc(file.name || "unnamed") + " → " + code(baseName + "-" + String(index + 1).padStart(3, "0") + ".png"))
      .join("\n");

    const extra = files.length > 5 ? "...dan " + (files.length - 5) + " file lainnya." : "";

    return page("✅ *Rename Preview*", [
      "",
      "Total files: *" + files.length + "* PNG",
      "Name format: " + code(baseName),
      "",
      "*Preview:*",
      preview,
      extra ? esc(extra) : "",
      "",
      "Ketik " + code("/confirm") + " buat eksekusi, atau " + code("/cancel") + " buat batal.",
    ].filter(Boolean));
  },

  renameNoJob() {
    return "📭 No pending rename job.";
  },

  renameJobEmpty() {
    return "📭 Empty job cleaned up.";
  },

  renameStarted(total) {
    return "🚀 Renaming " + total + " files...";
  },

  renameProgress(done, total) {
    return "⏳ Progress: " + done + "/" + total;
  },

  renameDone(ok, fail) {
    return page("✅ *Rename Complete*", [
      "",
      "Success: *" + ok + "*",
      "Failed: *" + fail + "*",
    ]);
  },

  cancelled() {
    return "✅ Flow cancelled.";
  },

  jobCancelled() {
    return "✅ Your job has been cancelled.";
  },

  ownerPanel() {
    return page("🛠 *Owner Panel*", [
      "",
      "Choose a quick action:",
    ]);
  },

  zipTools() {
    return page("📦 *Backup Tools*", [
      "",
      "• " + code("/zipstatus") + " — cek dependency zip",
      "• " + code("/panelzip") + " — build aman untuk panel",
      "• " + code("/privatezip <password>") + " — backup private terenkripsi",
      "• " + code("/cleanzip") + " — hapus release lama",
      "",
      "Use the commands above to build or manage backups.",
    ]);
  },

  updateHelp() {
    return page("⚙️ *Maintenance Mode*", [
      "",
      "• " + code("/update_on <pesan>") + " — aktifkan maintenance",
      "• " + code("/update_off <pesan>") + " — matikan maintenance",
      "• " + code("/update_status") + " — cek status maintenance",
    ]);
  },

  broadcastHelp() {
    return page("📢 *Broadcast Message*", [
      "",
      "*Format:*",
      code("/broadcast <pesan>"),
    ]);
  },

  ownerOnly() {
    return "⛔ *Owner only.*";
  },

  fallback() {
    return "Choose a menu button, or type /help.";
  },
};

module.exports = { text, esc, code, bold };

