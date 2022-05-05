const { createParty, isPartyLeader, partyLeaderHandler, adminHandler, memberHandler, joinHandler, getPartyMembers } = require("../constants/functions/lfg");

let joinCache = {}
let createCache = {}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    //Slash Commands
    if (interaction.isCommand()) {
      let commandExecute = interaction.commandName;

      if (interaction.options.getSubcommand(false) != null) {
        commandExecute = interaction.commandName + interaction.options.getSubcommand(false);
      }

      const command = interaction.client.slashCommands.get(commandExecute);

      if (command.devOnly && interaction.user.id !== interaction.client.application?.owner?.id) {
        return await interaction.reply("This command is Dev only.");
      }

      try {
        await interaction.deferReply({ ephemeral: command?.ephemeral ? true : false });
        command.execute(interaction);
      } catch (e) {
        log(e, "ERROR");
      }
    }

    //Buttons
    if (interaction.isButton()) {
      await interaction.deferUpdate();
      if (["T1", "T2", "T3", "T4", "T5"].includes(interaction.customId)) {
        const msg = await interaction.channel.send(createParty(interaction));
        return await msg.startThread({
          name: `${interaction.user.tag}'s Party`
        })
      } else if (["add_player", "kick_player", "run_started"].includes(interaction.customId)) {
        return await partyLeaderHandler(interaction);
      } else if(["disband_party"].includes(interaction.customId)) {
        return await adminHandler(interaction)
      } else if(["join_party"].includes(interaction.customId)) {
        if(!joinCache[interaction.user.id]) {
          joinCache[interaction.user.id] = []
        }
        if(joinCache[interaction.user.id].includes(interaction.message.id)) {
          return await interaction.followUp({content: "You already requested to join this party.", ephemeral: true})
        }
        joinCache[interaction.user.id].push(interaction.message.id)
        const mems = getPartyMembers(interaction.message.embeds[0])
        if(mems > 4) {
          return await interaction.followUp({content: "This party is already full.", ephemeral: true})
        }
        return await memberHandler(interaction)
      } else if(["allow", "deny"].includes(interaction.customId)) {
        return await joinHandler(interaction)
      }
    }
  },
};
