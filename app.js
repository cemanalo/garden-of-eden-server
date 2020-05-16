const express = require("express");
const cors = require('cors')
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require('body-parser')
const roomService = require('./services/room')

const port = process.env.PORT || 5000;
const index = require("./routes/index");
const gameStatus = require('./utils/gameStatus')

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: 'GET, PUT, POST, DELETE'
}))
app.use(bodyParser.json())
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on('userJoined', (name) => {
    console.log('userJoined', name)
    io.emit('userJoined', name)
  })

  socket.on('startGame', async (roomId) => {
    await roomService.updateRoomStatus(gameStatus.IN_PROGRESS, roomId)
    io.emit(`${roomId}::gameStarted`)
  })

  socket.on('appleSubmitted', (data) => {
    console.log('appleSubmitted', data)
    io.emit(`${data.roomId}::appleSubmitted`)
  })

  socket.on('endRound', async (data) => {
    const { roomId, round } = data
    console.log('endRound', data)
    await roomService.updateRoomStatus('ROUND_ENDED', roomId, round)
  })

  socket.on('nextRound', (roomId) => {
    console.log('nextRound', roomId)
    io.emit(`${roomId}::nextRound`)
  })

  socket.on('showResult', (roomId) => {
    console.log('showResult', roomId)
    io.emit(`${roomId}::showResult`)
  })

  socket.on('endGame', async (roomId) => {
    await roomService.updateRoomStatus(gameStatus.END, roomId)
    io.emit(`${roomId}::endGame`)
  })
});



server.listen(port, () => console.log(`Listening on port ${port}`));
