const commands = [
  {
    name: "sendpanel",
    description: "Send the LFG Panel for Kuudra Runs",
    options: [
      {
        name: "channel",
        description: "The Channel to send the Panel in",
        type: "CHANNEL",
        required: true,
      },
    ],
  },
  {
    name: "verify",
    description: "Verify your Account",
    options: [
      {
        name: "ign",
        description: "Your Minecraft IGN",
        type: "STRING",
        required: true,
      },
    ],
  },
];

module.exports = { commands };
