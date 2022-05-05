//General Stuff
require("dotenv").config();
const fs = require("fs");
const { start } = require("./global/index");
start();

//Discord Stuff
const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
client.login(process.env.TOKEN);

loadCommands(client);

const eventFiles = fs.readdirSync(__dirname + "/discord/events").filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./discord/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

//Errors that might slip
process.on("uncaughtException", (error) => console.log(error));
process.on("unhandledRejection", (error) => console.log(error));

//Server
const { startAPI } = require("./api/index.js");
startAPI();

//yea
function loadCommands(client) {
  client.messageCommands = new Discord.Collection();
  client.slashCommands = new Discord.Collection();

  if (fs.existsSync(__dirname + "/discord/commands/message")) {
    const folder = fs.readdirSync(__dirname + "/discord/commands/message");

    for (const file of folder) {
      const command = require(`./discord/commands/message/${file}`);
      client.messageCommands.set(command.name.toLowerCase(), command);
    }
    log(`Loaded Message Commands`);
  }

  if (fs.existsSync(__dirname + "/discord/commands/interaction")) {
    const folder = fs.readdirSync(__dirname + "/discord/commands/interaction");

    for (const file of folder) {
      const command = require(`./discord/commands/interaction/${file}`);
      client.slashCommands.set(command.name.toLowerCase(), command);
    }
    log(`Loaded Interaction Commands`);
  }
}
