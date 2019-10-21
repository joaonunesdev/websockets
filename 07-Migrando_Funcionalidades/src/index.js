const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } =  require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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
  
  // Handler para quando novos usuários entrarem no chat
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    
    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    
    callback()
  })
  
  // Monitora desconexões dos clientes
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    // Notifica a saída de um usuário da sala de bate-papo
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
    }
  })
  
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
