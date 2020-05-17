const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
const { promisify } = require("util");
const randomize = require('randomatic');
const rules = require('../rules/index');
const userService = require('./user')
const gameStatus = require('../utils/gameStatus')

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);


function formatKey(roomId) {
  return `room:${roomId}`
}

module.exports = {
  async createRoom() {
    const roomId = randomize('A', 6);

    await setAsync(formatKey(roomId), JSON.stringify({
      round: 1,
      gameStatus: gameStatus.WAITING_PLAYERS,
      users: []
    }))

    return roomId
  },

  async getRoom(roomId) {
    const room = await getAsync(formatKey(roomId))
    return JSON.parse(room)
  },

  async updateRoom(roomId, room) {
    await setAsync(formatKey(roomId), JSON.stringify(room))
    return room
  },

  async deleteAllRoom() {
    client.flushall()
  },

  async addJoinedUser(roomId, userId) {
    const formattedId = formatKey(roomId)
    let room = await getAsync(formattedId)
    room = JSON.parse(room)
    room.users.push(userId)
    await setAsync(formattedId, JSON.stringify(room))
  },

  async updateRoomStatus(status, roomId) {
    const formattedId = formatKey(roomId)
    let room = await getAsync(formattedId)
    room = JSON.parse(room)
    room.gameStatus = status

    return await setAsync(formattedId, JSON.stringify(room))
  },
  
  async updateRoomToNextRound(roomId) {
    const formattedId = formatKey(roomId)
    let room = await getAsync(formattedId)
    room = JSON.parse(room)
    room.round = room.round + 1
    room.gameStatus = gameStatus.IN_PROGRESS

    await setAsync(formattedId, JSON.stringify(room))
    return room
  },

  async updateRoundResult(roomId, round) {
    console.log('updateRoundResult', roomId, round)
    const status = 'ROUND_ENDED'
    const formattedId = formatKey(roomId)
    let room = await getAsync(formattedId)
    room = JSON.parse(room)
    room.gameStatus = status

    await setAsync(formattedId, JSON.stringify(room))
    const users = room.users
    const mappedUsers = await Promise.all(users.map(async (userid) => await userService.getUserByRoom(userid, roomId)))

    const gold = mappedUsers.filter(user => user.round && user.round[round] === 'Gold')
    const silver = mappedUsers.filter(user => user.round && user.round[round] === 'Silver')
    const red = mappedUsers.filter(user => user.round && user.round[round] === 'Red')

    const outcome = rules.getOutCome(gold, silver, red)

    switch(outcome) {
      case 'GOLD_SILVER': {
        if(gold.length > silver.length) {
          gold.map(user => rules.add1M(user, round))
          silver.map(user => rules.minus1M(user, round))
        } else if (silver.length > gold.length) {
          silver.map(user => rules.add1M(user, round))
          gold.map(user => rules.minus1M(user, round))
        } else {
          silver.map(user => rules.minus1M(user, round))
          gold.map(user => rules.minus1M(user, round))
        }
        break
      }
      case 'ALL_GOLD': {
        gold.map(user => rules.minus1M(user, round))
        break
      }
      case 'ALL_SILVER': {
        silver.map(user => rules.minus1M(user, round))
        break
      }
      case 'ALL_RED': {
        red.map(user => rules.add1M(user, round))
        break
      }
      case 'TWO_RED': {
        red.map(user => rules.minus1M(user, round))
        gold.map(user => rules.add1M(user, round))
        silver.map(user => rules.add1M(user, round))
        break
      }
      case 'ONE_RED': {
        red.map(user => rules.minus10M(user, round))
        gold.map(user => rules.add1M(user, round))
        silver.map(user => rules.add1M(user, round))
        break
      }
      case 'ONE_GOLD_XOR_SILVER': {
        red.map(user => rules.minus1M(user, round))
        gold.map(user => rules.add2M(user, round))
        silver.map(user => rules.add2M(user, round))
      }
    }

    const mergedUsers = [ ...red, ...gold, ...silver ]
    const updateUsers = await Promise.all(mergedUsers.map(async (user) => {
      const { userId } = user
      return await userService.updateUser(userId, roomId, user)
    }))
    return updateUsers
  }
}