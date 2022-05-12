const Discord = require("discord.js");
const { errEmbed, sucEmbed } = require("../../constants/functions/embed");

module.exports = {
  name: "get-user",
  devOnly: false,
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const found = await interaction.client.collection.findOne({ "discord.id": user.id });

    if (found) {
      return interaction.editReply({ embeds: [sucEmbed(`Discord: <@${user.id}> [\`${user.tag}\`]\nMinecraft IGN: \`${found.minecraft.name}\`\nMinecraft UUID: \`${found.minecraft.uuid}\``)] });
    } else {
      return interaction.editReply({ embeds: [errEmbed(`No data found for <@${user.id}> [\`${user.tag}\`]`)] });
    }
  },
};
