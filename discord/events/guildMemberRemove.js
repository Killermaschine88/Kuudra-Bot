module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    client.channels.cache.get("976055354846752818").send(`Goodbye **${member.user.tag}**, we now have **${member.guild.memberCount} members.**`);
  },
};
