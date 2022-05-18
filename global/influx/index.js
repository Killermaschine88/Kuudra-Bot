const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const token = process.env.INFLUXDB_TOKEN;
const url = process.env.INFLUX_URL;

const influx = new InfluxDB({ url, token });

async function postMetrics(client) {
  const writeApi = influx.getWriteApi(process.env.ORG, process.env.BUCKET);

  try {
    const guild = client.guilds.cache.get("971664626607587328");
    if (!guild) return;
    const point = new Point("stats").intField("users", guild.memberCount).intField("run_amount", await getRunAmount(client))
    writeApi.writePoint(point);
    log("Sent Data to Influx");
  } catch (e) {
    console.log(e);
  }
}

async function getRunAmount(client) {
  const msg = await client.channels.cache.get("971770778896957500").messages.fetch("972061438787067944");
  const embed = msg.embeds[0];
  const amount = embed.description.split(":")[1];
  return Number(amount)
}

module.exports = { postMetrics };
