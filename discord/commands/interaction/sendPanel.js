const Discord = require("discord.js");
let { createButtonRow } = require("../../constants/functions/general");

module.exports = {
  name: "sendPanel",
  devOnly: false,
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.editReply("Disallowed");

    const channel = interaction.options.getChannel("channel");

    if (channel.parent.id !== "971677727310614558") return interaction.editReply("Invalid Channel");

    const name = getPanelName(channel.id);

    const embed = new Discord.MessageEmbed().setTitle(`${name} Kuudra`).setDescription(`Click the "Create Group" button on this embed to start a Group.`);

    const row = createButtonRow([{ label: "Create Group", customId: getPanelName(channel.id), style: "PRIMARY" }]);

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply("Panel sent!");
  },
};

function getPanelName(id) {
  if (id === "971680589168123916") return "T1";
  if (id === "971681273015828490") return "T2";
  if (id === "978617983100416020") return "T3";
  if (id === "978618002431954964") return "T4";
  if (id === "978618036238037032") return "T5";
}
