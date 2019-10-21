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

// Evento é emitido sempre que este arquivo for carregado
socket.emit('join', { username: generateFakeName(), room: 'virtus1' }, error => {
  if (error) {
    alert(error)
    location.href = '/';
  }
})

// Handler para eventos de envio de mensagens
socket.on('message', ({ username, text, createdAt }) => {
  const html = Mustache.render($messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('h:mm a')
  });
  
  $messages.insertAdjacentHTML('beforeend', html);
})

// Configura o envio de mensagens de chat
$messageForm.addEventListener('submit', (e) => {
  // Evita que a página recarregue (não estamos informando um action no form)
  e.preventDefault()
  
  // Desabilita o botão quando o usuário clicar nele
  $messageFormButton.setAttribute('disabled', 'disabled')

  // Recupera a mensagem do input
  const messageText = e.target.elements.message.value

  // Emite o evento
  socket.emit('sendMessage', messageText, (error) => {
  
    // Habilita novamente o botão de envio de mensagem 
    $messageFormButton.removeAttribute('disabled')
    // Reseta o valor do input
    $messageFormInput.value = ''
    // O foco retorna para o input
    $messageFormInput.focus()

    // Se o callback for chamado com erro
    if (error) {
      return console.log(error)
    }

    // Acknowledgement do Socket.io
    // Só é exibido se o callback for chamado sem argumentos
    console.log('Message delivered!')
  })
})