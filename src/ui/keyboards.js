const { Markup } = require("telegraf");

function mainKeyboard(isOwnerUser = false) {
  const rows = [
    ["🔐 Connect Drive", "📊 Drive Status"],
    ["🔎 Check Folder", "✏️ Rename Assets"],
    ["ℹ️ Help"],
  ];

  if (isOwnerUser) {
    rows.push(["🧠 Selfcheck", "👥 Users"]);
    rows.push(["📦 Backup Tools"]);
  }

  return Markup.keyboard(rows).resize();
}

function mainInlineKeyboard(isOwnerUser = false) {
  const rows = [
    [
      Markup.button.callback("🔐 Connect Drive", "menu_auth"),
      Markup.button.callback("📊 Drive Status", "menu_auth_status"),
    ],
    [
      Markup.button.callback("🔎 Check Folder", "menu_checking"),
      Markup.button.callback("✏️ Rename Assets", "menu_rename"),
    ],
    [Markup.button.callback("ℹ️ Help", "menu_help")],
  ];

  if (isOwnerUser) {
    rows.push([Markup.button.callback("🛠 Owner Panel", "menu_owner_panel")]);
  }

  return Markup.inlineKeyboard(rows);
}

function backHomeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function authStatusKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🔐 Connect Drive", "menu_auth"),
      Markup.button.callback("🔄 Refresh", "menu_auth_status"),
    ],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function authRequiredKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔐 Connect Drive dulu", "menu_auth")],
    [Markup.button.callback("📊 Cek Status Auth", "menu_auth_status")],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function reauthConfirmKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔁 Ya, Re-Auth", "menu_reauth_confirm")],
    [Markup.button.callback("📊 Cek Status", "menu_auth_status")],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function checkingResultKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📄 File List", "checking_file_list:1"),
      Markup.button.callback("✏️ Rename Assets", "menu_rename"),
    ],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function fileListKeyboard(page, totalPages) {
  const current = Number(page || 1);
  const total = Number(totalPages || 1);
  const nav = [];

  if (current > 1) nav.push(Markup.button.callback("⬅️ Prev", "checking_file_list:" + (current - 1)));
  nav.push(Markup.button.callback(current + "/" + total, "noop"));
  if (current < total) nav.push(Markup.button.callback("Next ➡️", "checking_file_list:" + (current + 1)));

  return Markup.inlineKeyboard([
    nav,
    [Markup.button.callback("📊 Summary", "checking_summary")],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function ownerInlineKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🔐 Connect Drive", "owner_auth"),
      Markup.button.callback("🧠 Selfcheck", "owner_selfcheck"),
    ],
    [
      Markup.button.callback("👥 Users", "owner_users"),
      Markup.button.callback("📦 Backup Tools", "owner_zip_tools"),
    ],
    [
      Markup.button.callback("⚙️ Maintenance", "owner_update_help"),
      Markup.button.callback("📢 Broadcast", "owner_broadcast_help"),
    ],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function accessRequestKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔑 Minta Akses", "request_access")],
  ]);
}

function ownerPanelKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📊 OAuth Status", "owner_oauth_status"),
      Markup.button.callback("🧠 Selfcheck", "owner_selfcheck"),
    ],
    [
      Markup.button.callback("👥 Users", "owner_users"),
      Markup.button.callback("📦 ZIP Status", "owner_zipstatus"),
    ],
    [Markup.button.callback("⬅️ Back", "menu_home")],
  ]);
}

function cancelFlowKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("❌ Batal", "cancel_flow")],
  ]);
}

function accessDecisionKeyboard(uid) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Izinkan", "access_allow:" + uid),
      Markup.button.callback("❌ Tolak", "access_deny:" + uid),
    ],
  ]);
}

module.exports = {
  mainKeyboard,
  mainInlineKeyboard,
  backHomeKeyboard,
  authStatusKeyboard,
  authRequiredKeyboard,
  reauthConfirmKeyboard,
  checkingResultKeyboard,
  fileListKeyboard,
  ownerInlineKeyboard,
  accessRequestKeyboard,
  ownerPanelKeyboard,
  cancelFlowKeyboard,
  accessDecisionKeyboard,
};

