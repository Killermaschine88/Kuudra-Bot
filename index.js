//General Stuff
require("dotenv").config();
const fs = require("fs");
const { start } = require("./global/index");
start();

//Discord Stuff
const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] });
client.login(process.env.TOKEN);
client.reload = loadCommands;
const { DiscordTogether } = require("discord-together");
client.discordTogether = new DiscordTogether(client);

loadCommands(client);
global.dclient = client;

//Some config stuff
client.config = require("./config.json");;

//Assign Mongo Utils
/*const { findOne } = require("./discord/constants/functions/mongo")
client.mongo.findOne = findOne*/

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
process.on("uncaughtException", (error) => {
  log({ str: error.stack, type: "ERROR", origin: "Uncaught Exception Handler" });
});
process.on("unhandledRejection", (error) => {
  log({ str: error.stack, type: "ERROR", origin: "Unhandled Rejection Handler" });
});

//Server
const { startAPI } = require("./api/index.js");
//startAPI();

//MongoDB
const { MongoClient } = require("mongodb");
client.mongo = new MongoClient(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.mongo.connect();
client.collection = client.mongo.db("KG").collection("users");

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
    log({ str: `Loaded Message Commands`, type: "INFO", origin: "Command Loader" });
  }

  if (fs.existsSync(__dirname + "/discord/commands/interaction")) {
    const folder = fs.readdirSync(__dirname + "/discord/commands/interaction");

    for (const file of folder) {
      const command = require(`./discord/commands/interaction/${file}`);
      client.slashCommands.set(command.name.toLowerCase(), command);
    }
    log({ str: `Loaded Interaction Commands`, type: "INFO", origin: "Command Loader" });
  }
}
