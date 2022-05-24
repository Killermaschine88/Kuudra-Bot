const Discord = require("discord.js");
let { createButtonRow } = require("../../constants/functions/general");

module.exports = {
  name: "sendPanel",
  devOnly: false,
  async execute(interaction) {
    if (!interaction.member.roles.cache.has("971668152914182164")) return interaction.editReply("Disallowed");

    const channel = interaction.options.getChannel("channel");

    if (channel.parent.id !== "971677727310614558") return interaction.editReply("Invalid Channel");

    const name = getPanelName(interaction);

    const embed = new Discord.MessageEmbed().setTitle(`${name} Kuudra`).setDescription(`Click the "Create Group" button on this embed to start a Group.`);

    const row = createButtonRow([{ label: "Create Group", customId: getPanelName(channel.id), style: "PRIMARY" }]);

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply("Panel sent!");
  },
};

function getPanelName(interaction) {
  if (interaction.channel.id === "971680589168123916") return interaction.config.pingRole.t1;
  if (interaction.channel.id === "971681273015828490") return interaction.config.pingRole.t2;
}
