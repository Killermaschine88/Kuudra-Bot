module.exports = {
  name: "ready",
  async execute(client) {
    log({ str: "Ready" });
    log({ str: `Logged into Discord`, origin: "Ready Event" });

    client.user.setActivity("Kuudra die", {
      type: "WATCHING",
    });
    await client.application.fetch();
  },
};
