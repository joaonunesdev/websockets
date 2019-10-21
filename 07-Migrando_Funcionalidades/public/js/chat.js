const  socket  =  io()

// Recupera os elementos da página de chat
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Função auxiliar que cria uma sequência aleatória de caracteres
// Será removida em seguida
const generateFakeName = () => {
  const nameLength = 5
  var fakeName = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length

  for (var i = 0; i < nameLength; i++) {
    fakeName += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return fakeName
}

socket.emit('join', { username: generateFakeName(), room: 'virtus1' }, error => {
  if (error) {
    alert(error)
    location.href = '/';
  }
})

socket.on('message', ({ username, text, createdAt }) => {
  const html = Mustache.render($messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('h:mm a')
  });
  
  $messages.insertAdjacentHTML('beforeend', html);
})