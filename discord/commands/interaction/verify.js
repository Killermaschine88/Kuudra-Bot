const Discord = require("discord.js");
const axios = require("axios");
const { errEmbed, sucEmbed } = require("../../constants/functions/embed");

//Skyblock
const { decodeAllInventories, itemCheck, getAPIStatus } = require("../../constants/functions/skyblock");

module.exports = {
  name: "verify",
  devOnly: false,
  async execute(interaction) {
    const ign = interaction.options.getString("ign");

    await interaction.editReply({ embeds: [new Discord.MessageEmbed().setDescription("Attempting to verify you...")] });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (e) {} //Ignore Error
    }, 20000);

    const res = await getData(ign);

    if (res === "API Error") {
      return await interaction.editReply({ embeds: [errEmbed("An Error occured while requesting API Data, try again later.")] });
    }
    if (res.discord === "None") {
      return await interaction.editReply({ embeds: [errEmbed(`The Minecraft Account your provided is linked to: \`${res.discord}\`\nYour Discord Account is: \`${interaction.user.tag}\``)] });
    }

    if (res.name === "None") {
      return await interaction.editReply({ embeds: [errEmbed(`The Minecraft Account your provided is invalid.`)] });
    }

    if (res.discord === interaction.user.tag) {
      try {
        await interaction.member.setNickname(res.name, "Verified");
        await interaction.member.roles.add(interaction.client.config.roles.verified);
      } catch (e) {} //Ignore Error

      await updateDB(interaction, res.name, res.uuid);

      //Automatic role check
      const profile = await getItemData(res.uuid);
      if (profile.api) {
        if (profile.hasHyperion) {
          try {
            interaction.member.roles.add(interaction.client.config.roles.hyperion, "Hyperion detected when verifying");
          } catch (e) {} //Ignore Error
        }
        if (profile.hasTerminator) {
          try {
            interaction.member.roles.add(interaction.client.config.roles.terminator, "Terminator detected when verifying");
          } catch (e) {} //Ignore Error
        }
      }

      interaction.client.channels.cache.get(interaction.client.config.log.verify).send({ embeds: [sucEmbed(`<@${interaction.user.id}> - \`${interaction.user.tag}\` [${interaction.user.id}] verified as \`${res.name}\``)] });
      await interaction.editReply({ embeds: [sucEmbed(`Verified as \`${res.name}\``)] });
    } else {
      await interaction.editReply({ embeds: [errEmbed(`Couldn't verify you as \`${res.name}\`\nAccount linked to: \`${res.discord}\`\nYour Account: \`${interaction.user.tag}\``)] });
    }
  },
};

async function getData(ign, interaction) {
  let data;
  let name = "";
  let discord = "";
  const uuid = await getUUID(ign, interaction);
  if (!uuid) {
    return "API Error";
  }
  try {
    const res = (await axios.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${uuid}`))?.data;
    if (res.success) {
      name = res.player?.displayname || "None";
      discord = res.player.socialMedia?.links?.DISCORD || "None";
    } else {
      name = res.player.displayName;
      discord = "None";
    }
    return {
      name: name,
      discord: discord,
      uuid: uuid,
    };
  } catch (e) {
    log({ str: e.stack, type: "ERROR", origin: "getData Function (Verify Command)", data: interaction });
    return "API Error";
  }
}

async function getUUID(ign, interaction) {
  let response = null;
  try {
    response = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`))?.data;
  } catch (e) {
    log({ str: e.stack, type: "ERROR", origin: "getUUID Function (Verify Command)", data: interaction });
  }

  if (response?.id) {
    return response.id;
  } else {
    return null;
  }
}

async function updateDB(interaction, ign, uuid) {
  return await interaction.client.collection.updateOne({ "discord.id": interaction.user.id }, { $set: { discord: { id: interaction.user.id }, minecraft: { name: ign, uuid: uuid } } }, { upsert: true });
}

async function getItemData(uuid) {
  let data = (await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${process.env.API_KEY}&uuid=${uuid}`))?.data;
  data.profiles = data.profiles.filter((e) => e.last_save);
  const profile = data.profiles.sort((a, b) => b.last_save - a.last_save)[0];
  const player = profile.members[uuid];
  const items = await decodeAllInventories(player);
  const api = getAPIStatus(player);
  if (!api.inventory) return { hasHyperion: false, hasTerminator: false, api: false };
  const hasItems = await itemCheck(items);
  return {
    hasHyperion: hasItems.hasHyperion,
    hasTerminator: hasItems.hasTerminator,
    api: true,
  };
}
