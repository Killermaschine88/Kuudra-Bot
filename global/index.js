const color = require("colorette");
let ready = false;

function start() {
  global.log = function ({ str, type = "INFO", origin = "Unknown", info }) {
    if (str === "Ready") {
      ready = true;
    }
    if (type === "INFO" && str !== "Ready") {
      process.stdout.write(`${new Date().toLocaleTimeString()} > ${str}\n`);
    } else if (type === "ERROR" && str !== "Ready") {
      process.stdout.write(`${color.red(`${new Date().toLocaleTimeString()} > ${str}`)}`);
    }

    if (ready && str !== "Ready") {
      // Base message
      let message = `<t:${Math.floor(Date.now() / 1000)}> [${type}] at **${origin}**\n`;

      //If info exists
      if (info) {
        if (info.user) {
          message += `User: ${info.user}\n`;
        }
        if (info.channel) {
          message += `Channel: ${info.channel}\n`;
        }
      }
      //Error message
      message += `\`\`\`js\n${str}\n\`\`\``;

      //Sending message
      dclient.channels.cache.get("973575587400675328").send(message);
    }
  };
}

module.exports = { start };
