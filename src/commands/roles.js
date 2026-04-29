const { config } = require("../config");
const { loadRoles, saveRoles, isOwner, canManageBot } = require("../storage/roleStore");
const { loadMeta } = require("../storage/userStore");

function registerRoleCommands(bot) {
  bot.command("roles", async (ctx) => {
    const uid = String(ctx.from.id);
    if (!canManageBot(uid)) return ctx.reply("⛔ Owner/admin only.");

    const roles = loadRoles();
    const meta = loadMeta();
    const lines = ["🎭 Role List", ""];
    Object.entries(roles).forEach(([id, role]) => lines.push(id + " — " + role + " (" + (meta[id]?.name || "?") + ")"));
    return ctx.reply(lines.join("\n"));
  });

  bot.command("addrole", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const [target, roleRaw] = ctx.message.text.split(/\s+/).slice(1);
    const role = String(roleRaw || "").toLowerCase();
    const valid = ["user", "staff", "admin", "reseller"];

    if (!target || !role) return ctx.reply("Format: /addrole <id> <role>");
    if (!/^\d+$/.test(target)) return ctx.reply("❌ ID harus angka.");
    if (!valid.includes(role)) return ctx.reply("Role tidak valid. Pilihan: " + valid.join(", "));
    if (target === config.ownerId) return ctx.reply("Owner role sudah permanen.");

    const roles = loadRoles();
    roles[target] = role;
    saveRoles(roles);
    return ctx.reply("✅ Role " + target + " diubah jadi " + role + ".");
  });

  bot.command("removerole", async (ctx) => {
    if (!isOwner(String(ctx.from.id))) return ctx.reply("⛔ Owner only.");

    const target = ctx.message.text.split(/\s+/)[1];
    if (!target) return ctx.reply("Format: /removerole <id>");
    if (target === config.ownerId) return ctx.reply("❌ Tidak bisa hapus role owner.");

    const roles = loadRoles();
    delete roles[target];
    saveRoles(roles);
    return ctx.reply("✅ Role " + target + " dihapus. Default balik ke user.");
  });
}

module.exports = { registerRoleCommands };

