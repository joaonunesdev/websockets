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

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Evento é emitido sempre que este arquivo for carregado
socket.emit('join', { username, room }, error => {
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

// Handler para eventos localização
socket.on('locationMessage', (location) => {
  const html = Mustache.render($locationMessageTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

// Atualiza os dados da sala (sidebar)
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
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

// Configura o envio da localização do usuário
$sendLocationButton.addEventListener('click', (e) => {
  
  // Caso o navegador não tenha suporte para geolocalização 
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  // Desabilitamos temporariamente o botão de envio de localização
  $sendLocationButton.setAttribute('disabled', 'disabled')

  // Recupera a localização do usuário via browser
  navigator.geolocation.getCurrentPosition((position) => {
    
    // Emite um novo evento personalizado 
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled')
      console.log('Location shared')
    })
    
  })

})