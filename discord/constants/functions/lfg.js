const Discord = require("discord.js");
const { createButtonRow } = require("./general");

function createParty(interaction) {
  const embed = new Discord.MessageEmbed().setTitle(`${interaction.user.tag}'s Party`).setDescription(`Party Members: 1/4\nHyperion Mages: 0\nTerminator Archers: 0`).addField("Party Members", `<@${interaction.user.id}> - ${interaction.user.tag}`);
  const rows = [
    createButtonRow([
      { label: "Everyone", customId: ".", style: "PRIMARY", disabled: true },
      { label: "Join Party", customId: "join_party", style: "PRIMARY" },
    ]),
    createButtonRow([
      { label: "Party Leader", customId: "..", style: "PRIMARY", disabled: true },
      { label: "Add Player", customId: "add_player", style: "PRIMARY" },
      { label: "Kick Player", customId: "kick_player", style: "PRIMARY" },
      { label: "Run started", customId: "run_started", style: "PRIMARY" },
    ]),
    createButtonRow([
      { label: "Admin", customId: "...", style: "DANGER", disabled: true },
      { label: "Disband Party", customId: "disband_party", style: "DANGER" },
    ]),
  ];

  //+1 to parties created

  return { embeds: [embed], components: rows };
}

function isPartyLeader(interaction) {
  const leader = interaction.message.embeds[0].title.split("'")[0];

  return leader === interaction.user.tag ? true : false;
}

function isAdmin(interaction) {
  return interaction.member.roles.cache.has("971668152914182164") || interaction.member.roles.cache.has("971668500584202280") ? true : false;
}

async function memberHandler(interaction) {
  if(interaction.customId === "join_party") {
    //ya know handle the good stuff here
  }
}

async function partyLeaderHandler(interaction) {
  if (!isPartyLeader(interaction) && !isAdmin(interaction)) return await interaction.followUp({ content: "You are not this parties leader.", ephemeral: true });
  if (interaction.customId === "add_player") {
    //open modal to add user with (ign, hype(yes/no), term(yes/no))
  }
  if (interaction.customId === "kick_player") {
    //open modal to remove user with (ign)
  }
  if (interaction.customId === "run_started") {
    return await interaction.message.delete();
    //add +1 to counter in stats channel
  }
  if (interaction.customId === "run_cancelled") {
    return await interaction.message.delete();
    //add +1 to counter in stats channel
  }
}

async function adminHandler(interaction) {
  if (!isAdmin(interaction)) return await interaction.followUp({ content: "You are not an admin in this server.", ephemeral: true });

  if(interaction.customId === "disband_party") {
    return await interaction.message.delete()
    //add +1 to counter in stats channel
  }
}

module.exports = { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler };
