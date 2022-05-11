module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    client.channels.cache.get("971681311649566730").send(`Welcome to **${member.guild.name}** <@!${member.user.id}>, make sure to read <#972511331280367686> and <#972060040628404264>`)
  },
};
