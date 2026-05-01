console.log("BOOT 1");

require("dotenv").config();

console.log("BOOT 2");

try {
  const { startServer } = require("./src/server");
  console.log("BOOT 3");

  startServer();
  console.log("BOOT 4");
} catch (err) {
  console.error("CRASH:", err);
}
