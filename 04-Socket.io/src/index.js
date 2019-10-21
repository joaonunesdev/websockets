const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

// Cria a aplicação Express
const app = express()

// Cria um servidor HTTP usando a aplicação Express
const server = http.createServer(app)

// Conecta socket.io com o servidor HTTP
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// Monitora novas conexões para Socket.io
io.on('connection', () => {
  console.log('New connection with WebSocket')
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
