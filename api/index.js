const app = require("express")();
const PORT = 3000;

function startAPI() {
  app.listen(PORT, () => log(`API Running on port ${PORT}`));

  app.get("/", (req, res) => {
    res.send("/parties (Current Kuudra Parties needing Members)");
  });

  app.get("/parties", (req, res) => {
    res.send("WIP");
  });
}

module.exports = { startAPI };
