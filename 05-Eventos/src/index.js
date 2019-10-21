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

// Monitora novas conexões para com o servidor
io.on('connection', (socket) => {
  // Envia mensagem de boas vindas a um novo usuário que se conectou
  // A mensagem é enviada ao novo usuário (nova conexão), somente
  socket.emit('message', 'Welcome!')

  // Notifica o ingresso de um novo usuário no bate-papo
  socket.broadcast.emit('message', 'A new user has joined')

  // Monitora desconexões dos clientes
  socket.on('disconnect', (socket) => {
    // Notifica a saída de um usuário da sala de bate-papo
    io.emit('message', 'User has left the room!')
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
