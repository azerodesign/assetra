const { text } = require("./text");

function homeText() {
  return text.home();
}

function helpText(isOwnerUser = false) {
  return text.help(isOwnerUser);
}

module.exports = { homeText, helpText };

