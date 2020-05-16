const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
const { promisify } = require("util");
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

function formatKey(userId, roomId) {
  return `${userId}_${roomId}`
}

module.exports = {
  async joinUser(userId, roomId, name) {
    const secretName = uniqueNamesGenerator({ 
      dictionaries: [colors, animals],
      length: 2,
      separator: " "
    }); // red donkey
    const money = 1000000 // 1 million
    const body = {
      userId, name, secretName, money, dateJoined: new Date()
    }
    await setAsync(formatKey(userId, roomId), JSON.stringify(body))

    return body
  },

  async getUserByRoom(userId, roomId) {
    const user = await getAsync(formatKey(userId, roomId))
    return JSON.parse(user)
  },

  async updateUser(userId, roomId, user) {
    console.log('updateUser', user)
    await setAsync(formatKey(userId, roomId), JSON.stringify(user))
    return user
  },

  async updateUsers(roomId, users) {
    const updateUsers = await Promise.all(users.map(async (user) => {
      const { userId } = user
      return await setAsync(formatKey(userId, roomId), JSON.stringify(user))
    }))

    return updateUsers
  }
}