const Discord = require("discord.js");
const { createButtonRow } = require("./general");

function createParty(interaction) {
  const hypemages = hasHyperion(interaction.member) ? "1" : "0";
  const termarchers = hasTerminator(interaction.member) ? "1" : "0";
  const embed = new Discord.MessageEmbed().setTitle(`${interaction.user.tag}'s Party`).setDescription(`Party Members: 1/4\nHyperion Mages: ${hypemages}\nTerminator Archers: ${termarchers}`).addField("Party Members", `<@${interaction.user.id}> - ${interaction.user.tag}`);
  const rows = [
    createButtonRow([
      //Everyone Controls
      { label: "Everyone", customId: ".", style: "PRIMARY", disabled: true },
      { label: "Join Party", customId: "join_party", style: "PRIMARY" },
      { label: "Leave Party", customId: "leave_party", style: "PRIMARY" },
    ]),
    createButtonRow([
      //Party Leader Controls
      { label: "Party Leader", customId: "..", style: "PRIMARY", disabled: true },
      { label: "Run started", customId: "run_started", style: "PRIMARY" },
      { label: "Run cancelled", customId: "run_cancelled", style: "PRIMARY" },
    ]),
    /*createButtonRow([ //Party Leader Requirement Controls
      { label: "Requirements", customId: "...", style: "PRIMARY", disabled: true },
      { label: "Hyperion", customId: "hyperion_req", style: "DANGER" },
      { label: "Terminator", customId: "terminator_req", style: "DANGER" },
      { label: "Kuudra Slayer +", customId: "kuudra+_req", style: "DANGER" },
      { label: "Kuudra Slayer ++", customId: "kuudra++_req", style: "DANGER" },
    ]),*/
    createButtonRow([
      //Admin Controls
      { label: "Admin", customId: "....", style: "DANGER", disabled: true },
      { label: "Disband Party", customId: "disband_party", style: "DANGER" },
    ]),
  ];

  return {
    //content: getPingRole(interaction.channel),
    embeds: [embed],
    components: rows,
  };
}

function isPartyLeader(interaction, msg) {
  const leader = msg ? msg.embeds[0].title.split("'")[0] : interaction.message.embeds[0].title.split("'")[0];

  return leader === interaction.user.tag ? true : false;
}

function isAdmin(interaction) {
  return interaction.member.roles.cache.has("971668152914182164") || interaction.member.roles.cache.has("971668500584202280") ? true : false;
}

async function memberHandler(interaction) {
  if (interaction.customId === "join_party") {
    if (isPartyLeader(interaction)) return await interaction.followUp({ content: "You can not join your own party.", ephemeral: true });
    const embed = interaction.message.embeds[0];

    const leader = embed.fields[0].value.split("-")[0];
    const joinEmbed = new Discord.MessageEmbed().setDescription(`<@${interaction.user.id}> - ${interaction.user.id} wants to join the Party.\n\nHyperion: ${hasHyperion(interaction.member) ? "Yes" : "No"}\nTerminator ${hasTerminator(interaction.member) ? "Yes" : "No"}`);

    return await interaction.message.thread.send({
      content: `${leader}`,
      embeds: [joinEmbed],
      components: [
        createButtonRow([
          { label: "Allow", customId: "allow", style: "SUCCESS" },
          { label: "Deny", customId: "deny", style: "DANGER" },
        ]),
      ],
    });
  } else if (interaction.customId === "leave_party") {
    if (!inParty(interaction)) return await interaction.followUp({ content: "You are not a member of this party.", ephemeral: true });

    if (isPartyLeader(interaction)) return await interaction.followUp({ content: "You can not leave your own party.", ephemeral: true });

    const embed = interaction.message.embeds[0];
    const members = embed.fields[0].value.split("\n");
    let str = "";
    for (const member of members) {
      const id = `${member}`.split("-")[0].trim().replace("<", "").replace("@", "").replace(">", "");
      if (id !== interaction.user.id) {
        str += `${member}\n`;
      }
    }

    joinCache[interaction.user.id]?.splice(joinCache[interaction.user.id].indexOf(interaction.message.id), 1);

    const split = embed.description.split(":");
    let hypemages = Number(split[2].charAt(1));
    if (hasHyperion(interaction.member)) {
      hypemages--;
    }
    let termarchers = Number(split[3].charAt(1));
    if (hasTerminator(interaction.member)) {
      termarchers--;
    }
    embed.setDescription(`Party Members: ${getPartyMembers(interaction.message.embeds[0]) - 2}/4\nHyperion Mages: ${hypemages}\nTerminator Archers: ${termarchers}`);
    embed.fields[0].value = str;
    return await interaction.message.edit({ embeds: [embed] });
  }
}

async function partyLeaderHandler(interaction) {
  if (!isPartyLeader(interaction) && !isAdmin(interaction)) return await interaction.followUp({ content: "You are not this parties leader.", ephemeral: true });
  if (["run_started", "run_cancelled"].includes(interaction.customId)) {
    createdCache[interaction.user.tag] = false;
    await interaction.message.thread.delete();
    return await interaction.message.delete();
  }
}

async function adminHandler(interaction) {
  if (!isAdmin(interaction)) return await interaction.followUp({ content: "You are not an admin in this server.", ephemeral: true });

  if (interaction.customId === "disband_party") {
    createdCache[interaction.message.embeds[0].title.split("'")[0].trim()] = false;
    await interaction.message.thread.delete();
    return await interaction.message.delete();
  }
}

async function joinHandler(interaction) {
  if (!isPartyLeader(interaction, await interaction.channel.fetchStarterMessage())) return await interaction.followUp({ content: "You are not this parties leader.", ephemeral: true });
  if (interaction.customId === "allow") {
    const msg = await interaction.channel.fetchStarterMessage();
    const embed = msg.embeds[0];

    const split = embed.description.split(":");
    const user = await interaction.guild.members.fetch(interaction.message.embeds[0].description.split("-")[0].trim().replace("<", "").replace("@", "").replace(">", ""));
    let hypemages = Number(split[2].charAt(1));
    if (hasHyperion(user)) {
      hypemages++;
    }
    let termarchers = Number(split[3].charAt(1));
    if (hasTerminator(user)) {
      termarchers++;
    }

    await interaction.message.delete();

    const members = getPartyMembers(embed);
    if (members > 4) {
      return await interaction.channel.send("This Party is already full.");
    }

    await interaction.channel.send(`<@${user.id}> your join request was accepted.`);

    embed.fields[0].value += `\n<@${user.id}> - ${user.user.tag}`;

    embed.setDescription(`Party Members: ${members}/4\nHyperion Mages: ${hypemages}\nTerminator Archers: ${termarchers}`);

    if (members === 4) {
      const mems = embed.fields[0].value.split("\n");
      await interaction.channel.send(`${notifyPartyMembers(mems)}`);
    }

    return msg.edit({ embeds: [embed] });
  } else {
    const user = interaction.message.embeds[0].description.split("-")[0].trim();
    await interaction.message.delete();
    return await interaction.channel.send(`${user} your join request was denied.`);
  }
}

function hasHyperion(member) {
  return member.roles.cache.has("971832680796815460") ? true : false;
}

function hasTerminator(member) {
  return member.roles.cache.has("971832711876583474") ? true : false;
}

function getPartyMembers(embed) {
  const members = embed.fields[0].value.split("\n");
  return members.length + 1;
}

function notifyPartyMembers(members) {
  let str = "";
  for (const mem of members) {
    str += mem.split("-")[0];
  }
  return `${str.trim()} your party is ready make sure to party everyone and then close the PartyFinder message.`;
}

function inParty(interaction) {
  const members = interaction.message.embeds[0].fields[0].value.split("\n");
  for (const member of members) {
    const id = `${member}`.split("-")[0].trim().replace("<", "").replace("@", "").replace(">", "");
    if (id === interaction.user.id) {
      return true;
    }
  }
  return false;
}

function getPingRole(channel) {
  if (channel.id === "971680589168123916") return "<@&972027217120993320>";
  if (channel.id === "971681273015828490") return "<@&972027239581487174>";
}

function requirementCheck(interaction) {
  const rows = interaction.message.components;
  let allowed = true
  let roles = []

  //Add the role check to the statement and returm the array of missing roles

  if (rows[2].components[1].style === "SUCCESS") {
    //Hyperion Enjoyer
    return { allowed: interaction.member.roles.cache.has("971832680796815460") ? true : false, role: "<@&971832680796815460" };
  }
  if (rows[2].components[2].style === "SUCCESS") {
    //Terminator Enjoyer
    return { allowed: interaction.member.roles.cache.has("971832711876583474") ? true : false, role: "<@&971832711876583474" };
  }
  if (rows[2].components[3].style === "SUCCESS") {
    //Kuudra Slayer +
    return { allowed: interaction.member.roles.cache.has("971677430685237310") ? true : false, role: "<@&971677430685237310" };
  }
  if (rows[2].components[4].style === "SUCCESS") {
    //Kuudra Slayer ++
    return { allowed: interaction.member.roles.cache.has("971677499018870814") ? true : false, role: "<@&971677499018870814" };
  }
}

module.exports = { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler, hasHyperion, hasTerminator, joinHandler, getPartyMembers, getPingRole, requirementCheck };
