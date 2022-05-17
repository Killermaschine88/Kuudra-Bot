const commands = [
  {
    name: "sendpanel",
    description: "Send the LFG Panel for Kuudra Runs",
    options: [
      {
        name: "channel",
        description: "The Channel to send the Panel in",
        type: "CHANNEL",
        channel_types: [0],
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
  {
    name: "get-user",
    description: "Get User data",
    options: [
      {
        name: "user",
        description: "The User to check",
        type: "USER",
        required: true,
      },
    ],
  },
  {
    name: "game",
    description: "Start a Discord VC Game",
    options: [
      {
        name: "channel",
        description: "The Channel to start it in",
        type: "CHANNEL",
        channel_types: [2],
        required: true,
      },
      {
        name: "type",
        description: "What you want to start",
        type: "STRING",
        required: true,
        choices: [
          {
            name: "Youtube",
            value: "youtube",
          },
          {
            name: "Poker",
            value: "poker",
          },
          {
            name: "Chess",
            value: "chess",
          },
          {
            name: "Checkers in the Park",
            value: "checkers",
          },
          {
            name: "Betrayal",
            value: "betrayal",
          },
          {
            name: "Fishington",
            value: "fishing",
          },
          {
            name: "Letter Tile",
            value: "lettertile",
          },
          {
            name: "Words Snack",
            value: "wordsnack",
          },
          {
            name: "Doodle Crew",
            value: "doodlecrew",
          },
          {
            name: "SpellCast",
            value: "spellcast",
          },
          {
            name: "Awkword",
            value: "awkword",
          },
          {
            name: "Puttparty",
            value: "puttparty",
          },
          {
            name: "Sketchheads",
            value: "sketchheads",
          },
          {
            name: "Ocho",
            value: "ocho",
          },
        ],
      },
    ],
  },
];

module.exports = { commands };
