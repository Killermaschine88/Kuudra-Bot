const color = require("colorette");
let ready = false;

function start() {
  global.log = function (str, type = "INFO") {
    if (str === "Ready") {
      ready = true;
    }
    if (type === "INFO" && str !== "Ready") {
      process.stdout.write(`${new Date().toLocaleTimeString()} > ${str}\n`);
    } else if (type === "ERROR" && str !== "Ready") {
      console.error(`${color.red(`${new Date().toLocaleTimeString()} > ${str}`)}`);
    }

    if (ready && str !== "Ready") {
      dclient.channels.cache.get("973575587400675328").send(`<t:${Math.floor(Date.now() / 1000)}> [${type}]\n\`\`\`js\n${str}\n\`\`\``);
    }
  };
}

module.exports = { start };
