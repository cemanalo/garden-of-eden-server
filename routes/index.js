const express = require("express");
const router = express.Router();
const roomService = require('../services/room')
const userService = require('../services/user')
const gameStatus = require('../utils/gameStatus')

router.post('/room', async (req, res) => {
  const roomId = await roomService.createRoom()
  res.send(roomId).status(200)
})

router.get('/room/:id', async (req, res) => {
  const roomId = req.params.id
  const room = await roomService.getRoom(roomId)
  if (room) {
    res.send({ roomId, ...room}).status(200)
  } else {
    res.send(404)
  }
})

router.put('/room/:roomId', async (req, res) => {
  const roomId = req.params.roomId
  const room = req.body
  const updatedRoom = await roomService.updateRoom(roomId, room)
  res.send(updatedRoom).send(200)
})

router.delete('/room', (req, res) => {
  roomService.deleteAllRoom()
  res.send(200)
})

router.post('/room/:roomId/user/:userId', async (req, res) => {
  const { roomId, userId } = req.params
  const { name } = req.body

  const room = await roomService.getRoom(roomId)

  if(!room) {
    return res.send("Room not found").send(404)
  }

  if (name === 'admin') {
    return res.send({ userId, roomId, name })
  }

  const user = await userService.getUserByRoom(userId, roomId)

  if (user) {
    res.send({
      userId, roomId, ...user
    }).status(200)
  } else {
    const joinedUser = await userService.joinUser(userId, roomId, name)
    const updateRoom = await roomService.addJoinedUser(roomId, userId)
    res.send({
      userId, roomId, ...joinedUser
    })
  }
})

router.get('/user/:userId/room/:roomId', async (req, res) => {
  const { userId, roomId } = req.params
  const user = await userService.getUserByRoom(userId, roomId)

  if(!user) {
    return res.send(404)
  }

  return res.send(user).status(200)
})

router.get('/users', async (req, res) => {
  const roomId = req.query.roomId
  const usersInRoom = await roomService.getRoom(roomId)
  if (!usersInRoom) {
    return res.send(404)
  }
  
  const users = usersInRoom.users
  const mappedUsers = await Promise.all(users.map(async (userid) => await userService.getUserByRoom(userid, roomId)))
  res.send(mappedUsers).status(200)
})

router.post('/user/:userId/room/:roomId/submitApple', async (req, res) => {
  const { userId, roomId } = req.params
  const { round, apple } = req.body
  const user = await userService.getUserByRoom(userId, roomId)

  if(!user) {
    return res.send(404)
  }

  if (!user.round) {
    user.round = []
  }
  user.round[round] = apple
  await userService.updateUser(userId, roomId, user)

  res.send(user).status(200)
})

// generic user update
router.put('/user/:userId/room/:roomId', async (req, res) => {
  const user = req.body
  const { userId, roomId } = req.params
  const updatedUser = await userService.updateUser(userId, roomId, user)
  res.send(updatedUser).status(200)
})

// bulk update of users
router.put('/users', async (req, res) => {
  const roomId = req.query.roomId
  const users = req.body

  const updatedUsers = await userService.updateUsers(roomId, users)
  res.send(updatedUsers).send(200)
})

router.put('/room/:roomId/round/:round/endRound', async (req, res) => {
  const { roomId, round } = req.params
  const roundResult = await roomService.updateRoundResult(roomId, round)
  res.send(roundResult).status(200)
})

router.put('/room/:roomId/nextRound', async (req, res) => {
  const { roomId } = req.params
  const room = await roomService.updateRoomToNextRound(roomId)
  res.send(room).status(200)
})


router.put('/room/:roomId/endGame', async (req, res) => {
  const { roomId } = req.params
  const room = await roomService.updateRoomStatus(gameStatus.END, roomId)
  res.send(room).status(200)
})

module.exports = router;