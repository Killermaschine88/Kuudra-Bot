const { createParty, isPartyLeader, partyLeaderHandler, adminHandler } = require("../constants/functions/lfg");

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
        return await interaction.channel.send(createParty(interaction));
      } else if (["add_player", "kick_player", "run_started"].includes(interaction.customId)) {
        return await partyLeaderHandler(interaction);
      } else if(["disband_party"].includes(interaction.customId)) {
        return await adminHandler(interaction)
      }
    }
  },
};
