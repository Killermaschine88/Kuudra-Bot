const color = require("colorette");
let ready = false;

function start() {
  global.log = function ({ str, type = "INFO", origin = "Unknown", data }) {
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
      if (data) {
        if (data.user) {
          message += `User: <@${data.user.id}> [${data.user.tag}]`;
        }
        if (data.commandExecute || !data.commandExecute) {
          message += `Command: ${data.commandExecute ? data.commandExecute : data.customId}`;
        }
      }
      //Error message
      message += `\`\`\`js\n${str}\n\`\`\``;

      //Sending message
      dclient.channels.cache.get(dclient.config.log.console).send(message);
    }
  };
}

module.exports = { start };
