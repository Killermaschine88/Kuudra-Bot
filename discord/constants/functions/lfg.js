const Discord = require("discord.js");
const { createButtonRow } = require("./general");

function createParty(interaction) {
  const hypemages = hasHyperion(interaction) ? "1" : "0"
  const termarchers = hasTerminator(interaction) ? "1" : "0"
  const embed = new Discord.MessageEmbed().setTitle(`${interaction.user.tag}'s Party`).setDescription(`Party Members: 1/4\nHyperion Mages: ${hypemages}\nTerminator Archers: ${termarchers}`).addField("Party Members", `<@${interaction.user.id}> - ${interaction.user.tag}`);
  const rows = [
    createButtonRow([
      { label: "Everyone", customId: ".", style: "PRIMARY", disabled: true },
      { label: "Join Party", customId: "join_party", style: "PRIMARY" },
    ]),
    createButtonRow([
      { label: "Party Leader", customId: "..", style: "PRIMARY", disabled: true },
     // { label: "Add Player", customId: "add_player", style: "PRIMARY" },
    //  { label: "Kick Player", customId: "kick_player", style: "PRIMARY" },
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
    if(isPartyLeader(interaction)) return await interaction.followUp({content: "You can not join your own party.", ephemeral: true})
   const embed = interaction.message.embeds[0]
    
    const leader = embed.fields[0].value.split("-")[0]
    const joinEmbed = new Discord.MessageEmbed().setDescription(`<@${interaction.user.id}> - ${interaction.user.id} wants to join the Party.\n\nHyperion: ${hasHyperion(interaction) ? "Yes" : "No"}\nTerminator ${hasTerminator(interaction) ? "Yes" : "No"}`)
    

    return await interaction.message.thread.send({ content: `${leader}`, embeds: [joinEmbed], components: [createButtonRow([{label:"Allow", customId: "allow", style: "SUCCESS"}, {label: "Deny", customId: "deny", style: "DANGER"}])]})
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
  
  if (["run_started","run_cancelled"].includes(interaction.customId)) {
    await interaction.message.thread.delete()
    return await interaction.message.delete();
    //add +1 to counter in stats channel
  }
}

async function adminHandler(interaction) {
  if (!isAdmin(interaction)) return await interaction.followUp({ content: "You are not an admin in this server.", ephemeral: true });

  if(interaction.customId === "disband_party") {
    await interaction.message.thread.delete()
    return await interaction.message.delete()
    //add +1 to counter in stats channel
  }
}

async function joinHandler(interaction) {
  if(interaction.customId === "allow") {
    const msg = (await interaction.channel.fetchStarterMessage())
    const embed = msg.embeds[0]
    
    const split = embed.description.split(":")
    let hypemages = Number(split[2].charAt(1))
    if(hasHyperion(interaction)) {
      hypemages++
    }
    let termarchers = Number(split[3].charAt(1))
    if(hasTerminator(interaction)) {
      termarchers++
    }
    const user = await interaction.client.users.fetch(interaction.message.embeds[0].description.split("-")[0].trim().replace("<", "").replace("@", "").replace(">", ""))
    await interaction.message.delete()

    const members = getPartyMembers(embed)
    if(members > 4) {
      return await interaction.channel.send("This Party is already full.")
    }

    await interaction.channel.send(`<@${user.id}> your join request was accepted.`)

    embed.fields[0].value += `\n<@${user.id}> - ${user.tag}`
    
    embed.setDescription(`Party Members: ${members}/4\nHyperion Mages: ${hypemages}\nTerminator Archers: ${termarchers}`)

    if(members === 4) {
      const mems = embed.fields[0].value.split("\n")
      await interaction.channel.send(`${notifyPartyMembers(mems)}`)
    }

    return msg.edit({embeds: [embed]}) 
  } else {
    const user = interaction.message.embeds[0].description.split("-")[0].trim()
    await interaction.message.delete()
    return await interaction.channel.send(`${user} your join request was denied.`)
  }
}

function hasHyperion(interaction) {
  return interaction.member.roles.cache.has("971832680796815460") ? true : false
}

function hasTerminator(interaction) {
  return interaction.member.roles.cache.has("971832711876583474") ? true : false
}

function getPartyMembers(embed) {
  const members = embed.fields[0].value.split("\n")
  return members.length + 1
}

function notifyPartyMembers(members) {
  let str = ''
  for(const mem of members) {
    str += mem.split("-")[0]
  }
  return `${str.trim()} your party is ready make sure to party everyone and then close the PartyFinder message.`
}

module.exports = { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler, hasHyperion, hasTerminator, joinHandler, getPartyMembers };
