module.exports = {
  name: "ready",
  async execute(client) {
    log("Ready");
    log(`Logged into Discord`);

    client.user.setActivity("Kuudra die", {
      type: "WATCHING",
    });
    await client.application.fetch();
  },
};
