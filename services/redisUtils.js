const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");

const getKeys = promisify(client.keys).bind(client);

module.exports = {
  async getKeys(glob) {
    const keys = glob ? await getKeys(glob) : await getKeys()
    return keys
  }
}