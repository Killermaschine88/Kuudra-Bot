const Discord = require("discord.js");

function errEmbed(desc) {
  const embed = new Discord.MessageEmbed().setTitle("Error").setColor("RED").setDescription(desc);
  return embed;
}

function sucEmbed(desc) {
  const embed = new Discord.MessageEmbed().setTitle("Success").setColor("GREEN").setDescription(desc);
  return embed;
}

module.exports = { errEmbed, sucEmbed };
