const Discord = require("discord.js");

function createButtonRow(buttons) {
  const row = new Discord.MessageActionRow();
  for (const button of buttons) {
    const createdButton = new Discord.MessageButton().setStyle(button.style).setLabel(button.label).setCustomId(button.customId);
    if (button.emoji) createdButton.setEmoji(button.emoji);
    if (button.disabled) createdButton.setDisabled(true);
    row.components.push(createdButton);
  }
  return row;
}

async function updateInfoEmbed(client) {
  const msg = (await client.channels.cache.get("971770778896957500").messages.fetch("972061438787067944"))
  const embed = msg.embeds[0]
  const desc = embed.description.split(":")
  //embed.setDescription(`Parties created: ${Number(desc[1]) +1}`)
  return await msg.edit({embeds: [embed]})
}

module.exports = { createButtonRow, updateInfoEmbed };
