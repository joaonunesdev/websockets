const users = []

/**
* Adiciona um cliente no chat.
* @param  {Object}  objeto Representação de um cliente do chat.
*/
const addUser = ({ id, username, room }) => {
  // Trata os dados removendo espaços em branco e transformando em caixa baixa
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Valida os dados
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    }
  }

  // Verifica a existência de um usuário
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // Valida o nome de usuário
  if (existingUser) {
    return {
      error: 'Username is in use!'
    }
  }

  // Registra o usuário
  const user = { id, username, room }
  users.push(user)

  return { user }
}

/**
* Remove um cliente do chat.
* @param  {number}  id Identificador único do usuário.
*/
const removeUser = (id) => {
  // Encontra o índice do usuário com a id informada
  // Embora filter pudesse ser utilizado, essa abordagem é mais performática
  const index = users.findIndex((user) => user.id === id)

  // Remove o usuário pelo índice da array
  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

/**
* Recupera um usuário por meio da id.
* @param  {number}  id Identificador único do usuário.
*/
const getUser = (id) => {
  return users.find((user) => user.id === id)
}

/**
* Recupera os usuários de uma sala de chat.
* @param  {Object}  room Sala de chat
*/
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
