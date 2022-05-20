const { exec } = require("child_process");

module.exports = {
  name: "debug",
  async execute(debug) {
    if ((debug.includes("Hit a 429") && debug.includes("/gateway/bot")) || (debug.includes("Hit a 429") && debug.includes("Infinity"))) {
      exec("kill 1", (err, stdout, stderr) => {
        log({ err, stdout, stderr });
      });
    }
  },
};
