const { google } = require("googleapis");
const { loadToken } = require("../storage/tokenStore");
const { makeOAuthClient, verifyOAuthToken } = require("./oauth");

async function getAuthedDrive(userId) {
  const result = await verifyOAuthToken(userId);
  if (!result.ok) throw new Error(result.message.replace(/[✅❌⚠️]/g, "").trim());

  const tokens = loadToken(userId);
  if (!tokens) throw new Error("Belum login Google. Klik Auth Google dulu.");

  const auth = makeOAuthClient();
  auth.setCredentials(tokens);
  return google.drive({ version: "v3", auth });
}

function extractFolderId(input = "") {
  const text = String(input).trim();

  const folderMatch = text.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch) return folderMatch[1];

  const idParam = text.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idParam) return idParam[1];

  const generic = text.match(/[a-zA-Z0-9_-]{25,}/);
  return generic ? generic[0] : null;
}

async function getFolderInfo(drive, folderId) {
  const res = await drive.files.get({
    fileId: folderId,
    fields: "id,name,mimeType,webViewLink,owners(displayName,emailAddress),permissions(id,type,role,allowFileDiscovery),capabilities(canEdit,canShare)",
    supportsAllDrives: true,
  });

  const folder = res.data || {};
  const permissions = folder.permissions || [];
  const anyone = permissions.find((perm) => perm.type === "anyone");

  let visibility = "Private";
  if (anyone) {
    visibility = anyone.allowFileDiscovery ? "Public Searchable" : "Public Link";
  }

  return {
    id: folder.id,
    name: folder.name || "Unknown Folder",
    webViewLink: folder.webViewLink || "",
    ownerName: folder.owners?.[0]?.displayName || "Unknown",
    ownerEmail: folder.owners?.[0]?.emailAddress || "",
    visibility,
    canEdit: Boolean(folder.capabilities?.canEdit),
    canShare: Boolean(folder.capabilities?.canShare),
  };
}

async function listChildren(drive, folderId) {
  const items = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: "'" + folderId + "' in parents and trashed = false",
      fields: "nextPageToken, files(id, name, mimeType, size, webViewLink, owners(displayName,emailAddress), modifiedTime)",
      pageToken,
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    items.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return items;
}

function normalizeFile(item, folderDepth = 0) {
  const isFolder = item.mimeType === "application/vnd.google-apps.folder";
  const size = Number(item.size || 0);

  return {
    id: item.id,
    name: item.name || "unnamed",
    mimeType: item.mimeType || "",
    isFolder,
    isPng: item.mimeType === "image/png" || String(item.name || "").toLowerCase().endsWith(".png"),
    size,
    webViewLink: item.webViewLink || "",
    ownerName: item.owners?.[0]?.displayName || "",
    ownerEmail: item.owners?.[0]?.emailAddress || "",
    modifiedTime: item.modifiedTime || "",
    depth: folderDepth,
  };
}

async function collectFolderInventoryRecursive(drive, folderId, options = {}) {
  const maxDepth = Number(options.maxDepth ?? 30);
  const visited = options.visited || new Set();
  const depth = Number(options.depth || 0);

  if (!folderId || visited.has(folderId)) {
    return { files: [], folders: [], pngFiles: [], totalSize: 0 };
  }

  if (visited.size > 5000) throw new Error("Terlalu banyak folder. Proses dihentikan demi keamanan.");
  if (maxDepth < 0) return { files: [], folders: [], pngFiles: [], totalSize: 0 };

  visited.add(folderId);

  const result = {
    files: [],
    folders: [],
    pngFiles: [],
    totalSize: 0,
  };

  const children = await listChildren(drive, folderId);

  for (const raw of children) {
    const item = normalizeFile(raw, depth);
    const isFolder = item.isFolder;

    if (isFolder) {
      result.folders.push(item);

      const nested = await collectFolderInventoryRecursive(drive, item.id, {
        maxDepth: maxDepth - 1,
        visited,
        depth: depth + 1,
      });

      result.files.push(...nested.files);
      result.folders.push(...nested.folders);
      result.pngFiles.push(...nested.pngFiles);
      result.totalSize += nested.totalSize;
      continue;
    }

    result.files.push(item);
    result.totalSize += item.size;

    if (item.isPng) result.pngFiles.push(item);
  }

  return result;
}

async function collectPngRecursive(drive, folderId, options = {}) {
  const inventory = await collectFolderInventoryRecursive(drive, folderId, options);
  return inventory.pngFiles.map((file) => ({ id: file.id, name: file.name }));
}

async function renameDriveFile(drive, fileId, name) {
  return drive.files.update({
    fileId,
    requestBody: { name },
    supportsAllDrives: true,
  });
}

module.exports = {
  getAuthedDrive,
  extractFolderId,
  getFolderInfo,
  collectFolderInventoryRecursive,
  collectPngRecursive,
  renameDriveFile,
};

