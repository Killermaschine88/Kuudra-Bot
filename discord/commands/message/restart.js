const { exec } = require("child_process");

module.exports = {
  name: "restart",
  devOnly: true,
  alias: ["rs"],
  async execute(message, args, client) {
    await message.channel.send("Restarting ...");
    exec("pm2 restart 0", (err, stdout, stderr) => {
      console.log({ err, stdout, stderr }); //Leave this as console.log and not log
    });
  },
};
