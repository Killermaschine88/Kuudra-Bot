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

module.exports = { createButtonRow };
