const color = require("colorette");

function start() {
  global.log = function (str, type = "DEFAULT") {
    if (type === "DEFAULT") {
      console.log(`${new Date().toLocaleTimeString()} > ${str}`);
    } else if (type === "ERROR") {
      console.log(`${color.red(`${new Date().toLocaleTimeString()} > ${str}`)}`);
    }
  };
}

module.exports = { start };
