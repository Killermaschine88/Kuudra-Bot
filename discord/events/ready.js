module.exports = {
  name: "ready",
  async execute(client) {
    log(`Logged into Discord`);

    //Influx Metrics Stuff
    const { postMetrics } = require("../../global/influx/index.js");
    /*setInterval(() => {
      postMetrics(client);
    }, 60000)*/

    client.user.setActivity("Kuudra die", {
      type: "WATCHING",
    });
    await client.application.fetch();
  },
};
