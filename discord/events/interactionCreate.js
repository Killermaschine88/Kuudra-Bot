const { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler, joinHandler, getPartyMembers, requirementCheck, getTier } = require("../constants/functions/lfg");
const { updateInfoEmbed } = require("../constants/functions/general");

global.joinCache = {};
global.createdCache = {};

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    global.lastInteraction = interaction;

    //Slash Commands
    if (interaction.isCommand()) {
      let commandExecute = interaction.commandName;

      if (interaction.options.getSubcommand(false) != null) {
        commandExecute = interaction.commandName + interaction.options.getSubcommand(false);
      }

      const command = interaction.client.slashCommands.get(commandExecute);
      interaction.commandExecute = commandExecute;

      if (command.devOnly && interaction.user.id !== interaction.client.application?.owner?.id) {
        return await interaction.reply("This command is Dev only.");
      }

      try {
        await interaction.deferReply({ ephemeral: command?.ephemeral ? true : false });
        command.execute(interaction);
      } catch (e) {
        log({ str: e.stack, type: "ERROR", origin: "Interaction Create Event", data: interaction });
      }
    }

    //Buttons
    if (interaction.isButton()) {
      await interaction.deferUpdate({ ephemeral: true });
      if (["T1", "T2", "T3", "T4", "T5"].includes(interaction.customId)) {
        if (createdCache[interaction.user.tag]?.[interaction.customId]?.created) {
          return await interaction.followUp({ content: "You have already created a party.", ephemeral: true });
        }
        (createdCache[interaction.user.tag] ??= {})[interaction.customId] = { created: true, time: Date.now() + 300000 };
        await updateInfoEmbed(interaction.client);
        const msg = await interaction.channel.send(await createParty(interaction));
        return await msg.startThread({
          name: `${interaction.user.tag}'s Party`,
        });
      } else if (["run_started", "run_cancelled"].includes(interaction.customId)) {
        return await partyLeaderHandler(interaction);
      } else if (["disband_party"].includes(interaction.customId)) {
        return await adminHandler(interaction);
      } else if (["join_party", "leave_party"].includes(interaction.customId)) {
        /*const check = await requirementCheck(interaction)
        if(!check.allowed) {
          return await interaction.followUp({content: `You are missing the following ${check.roles.length > 1 ? "role" : "roles"}to join this party.\n${check.roles.join(", ")`, ephemeral: true})
        }*/
        if (interaction.customId === "join_party") {
          if (!joinCache[interaction.user.id]) {
            joinCache[interaction.user.id] = [];
          }
          if (joinCache[interaction.user.id].includes(interaction.message.id)) {
            return await interaction.followUp({ content: "You already requested to join this party.", ephemeral: true });
          }
          joinCache[interaction.user.id].push(interaction.message.id);
        }

        const mems = getPartyMembers(interaction.message.embeds[0]);
        if (mems > 4) {
          return await interaction.followUp({ content: "This party is already full.", ephemeral: true });
        }
        return await memberHandler(interaction);
      } else if (["allow", "deny"].includes(interaction.customId)) {
        return await joinHandler(interaction);
      }
    }
  },
};
