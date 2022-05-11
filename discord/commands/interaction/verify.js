const Discord = require("discord.js");
const axios = require("axios");
const { errEmbed, sucEmbed } = require("../../constants/functions/embed");

module.exports = {
  name: "verify",
  devOnly: false,
  async execute(interaction) {
    const ign = interaction.options.getString("ign");

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (e) {}
    }, 16000);

    const res = await getData(ign);
    if (res === "API Error") {
      return await interaction.editReply({ embeds: [errEmbed("An Error occured while requesting API Data, try again later.")] });
    }
    if (res.discord === "None") {
      return await interaction.editReply({ embeds: [errEmbed(`The Minecraft Account your provided is linked to: \`${res.discord}\`\nYour Discord Account is: \`${interaction.user.tag}\``)] });
    }

    if (res.discord === interaction.user.tag) {
      try {
        await interaction.member.setNickname(res.name, "Verified");
        await interaction.member.roles.add("972059917240385566");
      } catch (e) {}

      await updateDB(interaction, res.name, res.uuid)
      interaction.client.channels.cache.get("973232556919119942").send({ embeds: [sucEmbed(`<@${interaction.user.id}> - \`${interaction.user.tag}\` [${interaction.user.id}] verified as \`${res.name}\``)] });
      return await interaction.editReply({ embeds: [sucEmbed(`Verified as \`${res.name}\`, head over to <#973146681665269790> to claim roles.`)] });
    } else {
      return await interaction.editReply({ embeds: [errEmbed(`Couldn't verify you as \`${res.name}\`\nAccount linked to: \`${res.discord}\`\nYour Account: \`${interaction.user.tag}\``)] });
    }
  },
};

async function getData(ign) {
  let data;
  let name = "";
  let discord = "";
  const uuid = await getUUID(ign);
  if (!uuid) {
    return "API Error";
  }
  try {
    const res = (await axios.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${uuid}`))?.data;
    if (res.success) {
      name = res.player.displayname;
      discord = res.player.socialMedia?.links?.DISCORD || "None";
    } else {
      name = res.player.displayName;
      discord = "None";
    }
    return {
      name: name,
      discord: discord,
      uuid: uuid
    };
  } catch (e) {
    console.log(e);
    return "API Error";
  }
}

async function getUUID(ign) {
  const response = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`))?.data;
  if (response?.id) {
    return response.id;
  } else {
    return null;
  }
}

async function updateDB(interaction, ign, uuid) {
  const collection = interaction.client.mongo.db('KG').collection('users');

  return await collection.updateOne(
    { "discord.id": interaction.user.id },
    { $set: { discord: { id: interaction.user.id }, minecraft: { name: ign, uuid: uuid } }},
    { upsert: true }
  )
}