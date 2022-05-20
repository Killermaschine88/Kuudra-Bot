module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    if (message.channel.id === "972060040628404264" && !message.member.permissions.has("ADMINISTRATOR")) {
      setTimeout(() => {
        try {
          message.delete();
        } catch (e) {
          log(e.stack, "ERROR");
        }
      }, 30000);
    }

    if (!message.content.startsWith(process.env.PREFIX || "?")) return;

    const args = message.content
      .slice(process.env.PREFIX || "?")
      .trim()
      .split(/ +/);
    const commandName = args
      .shift()
      .toLowerCase()
      .replace(process.env.PREFIX || "?", "");
    const command = client.messageCommands.get(commandName) || client.messageCommands.find((cmd) => cmd.alias.includes(commandName));

    if (!command) return;

    if (command.devOnly) {
      if (message.author.id !== client.application?.owner?.id) {
        return message.channel.send("Only my developer is allowed to use this");
      }
    }

    if (process.env.LOGGING) {
      log(`${command.name} used by ${message.author.tag}`);
    }

    await command.execute(message, args, client);
  },
};
