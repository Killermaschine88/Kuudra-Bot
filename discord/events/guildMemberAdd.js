module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    client.channels.cache.get("971681311649566730").send(`Welcome to **${member.guild.name}** <@!${member.user.id}> you are our **${getCount(member)} member**, make sure to read <#972511331280367686> and <#972060040628404264>`)
  },
};

function getCount(member) {
  let ending = ""
  let count = `${member.guild.memberCount}`
  if(count.endsWith("1")) ending = "st"
  else if(count.endsWith("2")) ending = "nd"
  else if(count.endsWith("3")) ending = "rd"
  else ending = "th"
  return `${count}${ending}`
}