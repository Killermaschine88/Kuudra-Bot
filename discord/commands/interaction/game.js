const Discord = require("discord.js");
const { sucEmbed } = require("../../constants/functions/embed");

module.exports = {
  name: "game",
  devOnly: false,
  async execute(interaction) {
    const id = interaction.options.getChannel("channel").id;
    const game = interaction.options.getString("type");

    const invite = await interaction.client.discordTogether.createTogetherCode(id, game);
    return await interaction.editReply({embeds: [sucEmbed(`[Click here to join](${invite.code})`)]});
  },
};
