const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = 3000
const path = require('path')

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})

const GameSocket = require('./socket.js')

const sockets = {}

io.on('connection', (socket) => {
    sockets[socket.id] = new GameSocket(socket)

    socket.on('disconnect',() => {
        sockets[socket.id].disconnect()

        sockets[socket.id] = null
        delete sockets[socket.id]
    })
})

http.listen(port, () => {
  console.log(`Started on http://localhost:${port}`)
})