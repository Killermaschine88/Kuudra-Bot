const Discord = require("discord.js");
const { createButtonRow } = require("./general");
const hype = ""; //"<:hyperion:975726394619351060>"
const term = ""; //"<:terminator:975726471907778630>"

async function createParty(interaction) {
  const hypemages = hasHyperion(interaction.member) ? "1" : "0";
  const termarchers = hasTerminator(interaction.member) ? "1" : "0";
  const embed = new Discord.MessageEmbed()
    .setTitle(`${interaction.user.tag}'s Party`)
    .setDescription(`Party Members: 1/4\n${hype} Hyperion Mages: ${hypemages}\n${term} Terminator Archers: ${termarchers}`)
    .addField("Party Members", `<@${interaction.user.id}> - ${interaction.user.tag}`)
    .setThumbnail(`https://visage.surgeplay.com/head/${(await interaction.client.collection.findOne({ "discord.id": interaction.user.id })).minecraft.uuid}`);

  const rows = [
    createButtonRow([
      //Everyone Controls
      { label: "Everyone", customId: ".", style: "SECONDARY", disabled: true },
      { label: "Join Party", customId: "join_party", style: "SECONDARY" },
      { label: "Leave Party", customId: "leave_party", style: "SECONDARY" },
    ]),
    createButtonRow([
      //Party Leader Controls
      { label: "Party Leader", customId: "..", style: "PRIMARY", disabled: true },
      { label: "Started / Cancelled", customId: "run_started", style: "PRIMARY" },
      //{ label: "Run cancelled", customId: "run_cancelled", style: "PRIMARY" },
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

  interaction.client.channels.cache.get(interaction.client.config.log.party).send(`<@!${interaction.user.id}> - ${interaction.user.id} created a ${getTier(interaction)} party.`);

  return {
    content: interaction.member.roles.cache.has(interaction.client.config.roles.pingBypass) ? null : getPingRole(interaction), //If User has Ping Bypass Role dont ping users
    embeds: [embed],
    components: rows,
  };
}

function isPartyLeader(interaction, msg) {
  const leader = msg ? msg.embeds[0].title.split("'")[0] : interaction.message.embeds[0].title.split("'")[0];

  return leader === interaction.user.tag ? true : false;
}

function isAdmin(interaction) {
  return interaction.member.permissions.has("ADMINISTRATOR") ? true : false;
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

    try {
      joinCache[interaction.user.id]?.splice(joinCache[interaction.user.id].indexOf(interaction.message.id), 1);
    } catch (e) {}

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
  if (["run_started", "run_cancelled"].includes(interaction.customId) && createdCache[interaction.user.tag]?.[getTier(interaction)]?.time < Date.now()) {
    try {
      createdCache[interaction.user.tag][getTier(interaction)].created = false;
    } catch (e) {} // Ignore Error

    try {
      await interaction.message.thread.delete();
      return await interaction.message.delete();
    } catch (e) {} // Ignore Error
  } else if (!createdCache[interaction.user.tag]?.[getTier(interaction)]?.time) {
    try {
      await interaction.message.thread.delete();
      return await interaction.message.delete();
    } catch (e) {} // Ignore Error
  } else {
    return await interaction.followUp({ content: "You just recently created this party and it can't be closed immediately.", ephemeral: true });
  }
}

async function adminHandler(interaction) {
  if (!isAdmin(interaction)) return await interaction.followUp({ content: "You are not an admin in this server.", ephemeral: true });

  if (interaction.customId === "disband_party") {
    try {
      createdCache[interaction.message.embeds[0].title.split("'")[0].trim()][getTier(interaction)].created = false;
    } catch (e) {} // Ignore Error

    try {
      await interaction.message.thread.delete();
      return await interaction.message.delete();
    } catch (e) {} // Ignore Error
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

    try {
      await interaction.message.delete();
    } catch (e) {}

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
    try {
      await interaction.message.delete();
    } catch (e) {}
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

function getPingRole(interaction) {
  if (interaction.channel.id === interaction.client.channel.t1) return `<@&${interaction.client.config.pingRole.t1}>`;
  if (interaction.channel.id === interaction.client.channel.t2) return `<@&${interaction.client.config.pingRole.t2}>`;
}

function requirementCheck(interaction) {
  const rows = interaction.message.components;
  let allowed = true;
  let roles = [];

  //Add the role check to the statement and return the array of missing roles

  if (rows[2].components[1].style === "SUCCESS") {
    //Hyperion Enjoyer
    return { allowed: interaction.member.roles.cache.has(interaction.client.roles.hyperion) ? true : false, role: `<@&${interaction.client.roles.hyperion}>` };
  }
  if (rows[2].components[2].style === "SUCCESS") {
    //Terminator Enjoyer
    return { allowed: interaction.member.roles.cache.has(interaction.client.roles.terminator) ? true : false, role: `<@&${interaction.client.config.terminator}>` };
  }
  if (rows[2].components[3].style === "SUCCESS") {
    //Kuudra Slayer +
    return { allowed: interaction.member.roles.cache.has(interaction.client.roles.kuudraSlayer1) ? true : false, role: `<@&${interaction.client.roles.kuudraSlayer1}>` };
  }
  if (rows[2].components[4].style === "SUCCESS") {
    //Kuudra Slayer ++
    return { allowed: interaction.member.roles.cache.has(interaction.client.roles.kuudraSlayer2) ? true : false, role: `<@&${interaction.client.roles.kuudraSlayer2}>` };
  }
}

function getTier(interaction) {
  if (interaction.channel.id === interaction.client.config.channel.t1) return "T1";
  if (interaction.channel.id === interaction.client.config.channel.t2) return "T2";
  if (interaction.channel.id === interaction.client.config.channel.t2) return "T3";
  if (interaction.channel.id === interaction.client.config.channel.t2) return "T4";
  if (interaction.channel.id === interaction.client.config.channel.t2) return "T5";
}

module.exports = { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler, hasHyperion, hasTerminator, joinHandler, getPartyMembers, getPingRole, requirementCheck, getTier };
