# Introdução

Vamos criar uma aplicação de bate-papo em tempo real com Node (Chat App). A natureza non-blocking do Node  faz dele uma boa alternativa para este tipo de aplicação. Para ver o resultado final acesse: <a href="http://virtus-chat-app.herokuapp.com" target="_blank">http://virtus-chat-app.herokuapp.com/ </a>.

Alguns pontos que devem ser esclarecidos antes de prosseguirmos:

- Este mini projeto servirá apenas como um "playground" para testarmos alguns dos conceitos básicos de WebSockets e Socket.io.
- O código será sempre o mais simples possível com o intuito de propiciar um ambiente para explorar as funcionalidades do Socket.io. Portanto, não espere a aplicação de padrões de projetos, que o código seja o mais otimizado possível ou que exploremos todas as maravilhas do ES6. Mas sinta-se a vontade para fazer isso.
- Vamos focar nos detalhes e abstrair o que não nos interessa, como por exemplo, os arquivos de estilo da UI. Em alguns momentos nosso trabalho vai consistir em copiar e colar código.

# Criando o projeto

Nesta seção vamos dar *kick-off* no projeto criando a estrutura de arquivos e configurando um webserver básico com **Express**.

### Estrutura de arquivos

**Passo 1** - Crie uma estrutura de arquivos conforme a apresentada na figura abaixo. Estamos criando todos os arquivos do nosso projeto de forma antecipada, mas não se preocupe, em breve passaremos por todos estes arquivos. 

![](https://lh3.googleusercontent.com/QAMRiZMyC7mrOjReMaZbcHYC53VQI9PNJZsLBrkvMFV86aivI8HtuZ5ycKekdX3LjcaydHAIf5U "Estrutura")

**Passo 2** - Inicialize o **npm** e instale o **Express**.

Execute o seguinte comando no terminal (a partir do diretório raiz do projeto):
```
> npm init -y
```
A flag -y indica que o valor padrão para as configurações básicas do projeto devem ser adotadas. O resultado deve ser um arquivo **package.json** no seguinte formato:

```json
{
  "name": "chat-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Para instalar o **Express** basta executar o seguinte comando (a partir do diretório raiz do projeto):

```
> npm install express@4.17.1
```

**Passo 3** - Crie um servidor com **Express**.

```javascript
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
```

O código acima importa o **Express**, que é basicamente uma função. Em seguida atribuiremos esta função a uma variável de nome ``app``. Na terceira linha do código recuperamos a porta das variável de ambiente ``PORT`` caso exista, do contrário utilizamos a porta ``3000``.

Na linha 5 inicializamos o servidor passando a porta e uma função de callback. A função de callback não é obrigatória. No exemplo do código acima, quando o servidor for iniciado a mensagem *Server is up on port 3000* será exibida no terminal. Estamos utilizando ES6 template strings para imprimir a mensagem no terminal.

[Arquivos dos passos 1-3.](https://github.com/joaonunesdev/websockets/tree/master/01-Estrutura_Base)

**Passo 4** - Configure o diretório público que usaremos para servir os arquivos estáticos de nossa aplicação.

```javascript
const path = require('path')
const express = require('express')

const app = express()

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
```
No código acima estamos importando o módulo ``path`` que nos permite trabalhar com caminhos de arquivos e diretórios. Em seguida definimos uma constante ```publicDirectoryPath``` para armazenar o caminho do  diretório público da nossa aplicação. Para isso, utilizamos o método ```path.join()``` que faz o join de dois caminhos informados como parâmetros.   A variável ``__dirname`` representa o caminho do arquivo corrente (no caso, do arquivo **index.js**).

**Passo 5** - Preenchemos o aquivo **index.html** com o código abaixo para que seja renderizado o texto "Chat App" na tela.

```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
		Chat App
	</body>
</html>
```
Depois executamos o comando abaixo 
```
> node src/index.js
```

> Server is up on port 3000

Ao acessar o endereço **localhost:/3000** a página estática **index.html** deve ser renderizada com o texto "Chat App".

**Passo 6** - Configurando scripts no **package.json**.

Primeiro vamos criar o script "start" para iniciar o app usando node. Para isso vamos editar o arquivo **package.json**:
 ```json
 {
	"name": "chat-app",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"dependencies": {
	"express": "^4.17.1"
	}
}
 ```

Em "scripts" removemos a chave "test" (não iremos escrever testes neste projeto),  e adicionamos "start" e "dev" conforme o json abaixo:

 ```json
 {
	"name": "chat-app",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
		"start": "node src/index.js",
		"dev": "nodemon src/index.js"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"dependencies": {
	"express": "^4.17.1"
	}
}
 ```

Em seguida instalamos o nodemon como uma dependência de desenvolvimento:

```
> npm install nodemon@1.19.3 --save-dev
```
Se conferirmos o **package.json** vamos ver que **devDependecies** foi adicionado com **nodemon** como primeira dependência. A partir de agora, para rodar o servidor basta executar o comando ``npm run <nome-do-script>``, conforme exemplo abaixo:

```
> npm run dev
```

[Arquivos dos passos 4-6.](https://github.com/joaonunesdev/websockets/tree/master/02-Servindo_Arquivos)

# Mensagens

Antes de começarmos a usar Socket.io na nossa aplicação, vamos criar o utilitário que gera as mensagens do chat e de localização do usuário.  

**Passo 7** - Criando o utilitário de mensagens.

As mensagens de nosso chat devem possuir o nome de usuário que está postando, o texto da mensagem e a data de criação da mesma. A mensagem de localização do cliente possui o nome de usuário, uma url do google maps parametrizada com a latitude e longitude do usuário (capturada do browser) e a data de criação da mensagem.

Copie o código abaixo e cole no arquivo **src/utils/message.js**.

```javascript
/**
* Gera uma mensagem do chat.
*
* A mensagem contém o nome do usuário, o texto da mensagem
* e a data da criação da mensagem.
*
* @param  {string}  username
* @param  {string}  text
*/
const  generateMessage  = (username, text) => {
  return {
    username,
    text,
    createdAt:  new  Date().getTime()
  }
}

/**
* Gera a mensagem de localização do cliente.
*
* A mensagem contém o nome de usuário, a url do google maps
* com as coordenadas e a data de criação da mensagem.
*
* @param  {string}  username
* @param  {string}  url
*/
const  generateLocationMessage  = (username, url) => {
  return {
    username,
    url,
    createdAt:  new  Date().getTime()
  }
 }

module.exports  = {
  generateMessage,
  generateLocationMessage
}
```

# Usuários
O último passo antes de começarmos a trabalhar com Socket.io será criar as regras mais básicas de negócio de nossa aplicação.

**Passo 8** - Criando as regras de negócio de nossa aplicação.

Já adicionamos um arquivo **users.js** no diretório **utils**. Neste arquivo colocaremos a estrutura de dados que armazenará os usuários (um array simples) e quatro funções: ``addUser``, que adiciona um usuário na array de usuários; ``removeUser``, que remove um usuário da array de usuários;  ``getUser``, que recupera um usuário específico; e ``getUsersInRoom``, que recupera todos os usuários que estão em determinada sala de chat.

Copie o código abaixo e cole no arquivo **src/utils/users.js**

 ```javascript
const  users  = []

/**
* Adiciona um cliente no chat.
* @param  {Object}  objeto Representação de um cliente do chat.
*/
const  addUser  = ({ id, username, room }) => {
  // Trata os dados removendo espaços em branco e transformando em caixa baixa
  username  =  username.trim().toLowerCase()
  room  =  room.trim().toLowerCase()

  // Valida os dados
  if (!username  ||  !room) {
    return {
      error:  'Username and room are required!'
    }
  }

  // Verifica a existência de um usuário
  const  existingUser  =  users.find((user) => {
    return  user.room  ===  room  &&  user.username  ===  username
  })

  // Valida o nome de usuário
  if (existingUser) {
    return {
      error:  'Username is in use!'
    }
  }  

  // Registra o usuário
  const  user  = { id, username, room }
  users.push(user)

  return { user }
}

/**
* Remove um cliente do chat.
* @param  {number}  id Identificador único do usuário.
*/
const  removeUser  = (id) => {
  // Encontra o índice do usuário com a id informada
  // Embora filter pudesse ser utilizado, essa abordagem é mais performática
  const  index  =  users.findIndex((user) =>  user.id  ===  id)

  // Remove o usuário pelo índice da array
  if (index  !==  -1) {
    return  users.splice(index, 1)[0]
  }
  
}

/**
* Recupera um usuário por meio da id.
* @param  {number}  id Identificador único do usuário.
*/
const  getUser  = (id) => {
  return  users.find((user) =>  user.id  ===  id)
}

/**
* Recupera os usuários de uma sala de chat.
* @param  {Object}  room Sala de chat
*/
const  getUsersInRoom  = (room) => {
  room  =  room.trim().toLowerCase()
  return  users.filter((user) =>  user.room  ===  room)
}

module.exports  = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
```

[Arquivos dos passos 7-8.](https://github.com/joaonunesdev/websockets/tree/master/03-Core)

# WebSockets e Socket.IO

O protocolo WebSocket suporta comunicação bi-direcional (full-duplex) em tempo real, o que faz dele uma boa opção para criar a nossa aplicação de chat. Para mais informações acerca do protocolo WebSocket veja [este artigo](https://medium.com/reactbrasil/como-o-javascript-funciona-aprofundando-em-websockets-e-http-2-com-sse-como-escolher-o-caminho-d4639995ef85). 

Nesta aplicação utilizaremos Socket.IO. Socket.IO é uma biblioteca que permite a comunicação em tempo real, bidirecional e baseada em eventos entre o navegador, que consiste de um servidor Node.js, e uma biblioteca do lado cliente para o browser.

Para mais informações, acesse:  
- [O que é Socket.io?](https://socket.io/docs/#What-Socket-IO-is)
- [O que Socket.io não é?](https://socket.io/docs/#What-Socket-IO-is-not)

**Passo 9** - Instalando e configurando Socket.io.

Vamos instalar e configurar Socket.io, o qual possui tudo que precisamos para configuramos um servidor WebSocket com Node.

Para instalar socket.io execute o comando abaixo:

```
npm install socket.io@2.3.0
```

Socket.io pode ser utilizado de forma standalone ou com o Express. Haja vista que a nossa aplicação servirá arquivos do lado do cliente, ambos serão configurados. O arquivo abaixo mostra como isto pode ser feito (do lado servidor).

```javascript
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

// Cria a aplicação Express
const app = express()

// Cria um servidor HTTP usando a aplicação Express
const server= http.createServer(app)

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
```

O servidor logo acima usa ``io.on`` que é fornecido por Socket.io. O método ``on`` funciona como um *listener* para eventos do Socket.io. A chamada para  ``io.on('connection', () => {...}`` faz com que o servidor escute/monitore novas conexões, por meio do evento padrão do Socket.io ``connection``, o que permite a execução de algum código sempre que um novo cliente se conectar ao servidor.

Socket.io será também utilizado do lado cliente para que o mesmo possa se conectar ao servidor. Socket.io automaticamente serve o arquivo **/socket.io/socket.io.js** que contém o código que deve ficar do lado cliente. Para fazer o cliente se conectar ao nosso servidor devemos adicionar algumas tags de script no arquivo **public/index.html**, carregando assim a biblioteca do lado do cliente. Vamos também aproveitar e modificar o arquivo **/js/chat.js**.

No arquivo **public/index.html** adicione os seguintes scripts:

```html
<script  src="/socket.io/socket.io.js"></script>
<script  src="/js/chat.js"></script>
```
O arquivo **public/index.html** deve estar da seguinte forma: 
```html javascript
<!DOCTYPE  html>
<html>
  <head></head>
  <body>
    <script  src="/socket.io/socket.io.js"></script>
    <script  src="/js/chat.js"></script>
  </body>
</html>
```

A partir deste momento o JavaScript do lado do cliente pode se conectar com o servidor Socket.io chamando ``io`` . ``io`` é fornecido pela biblioteca Socket.io do lado do cliente. Ao chamar esta função a configuração será realizada, fazendo com que o código do *handler* do evento ``connection`` seja executado.

Adicione a seguinte linha de código no arquivo **public/js/chat.js**
```javascript
const  socket  =  io()
``` 

[Arquivos do passo 9.](https://github.com/joaonunesdev/websockets/tree/master/04-Socket.io)

Para mais informações consulte a documentação oficial:
- [Socket.io](https://socket.io/)

# Eventos 

Eventos em Socket.io permitem a transferência de dados do cliente para o servidor ou do servidor para o cliente.

Antes de por a mão na massa, vamos estabelecer alguns conceitos básicos. Há dois lados para cada evento, o remetente (*sender*) e o receptor (*receiver*). Se o servidor é o remetente, o cliente é o receptor. Se o cliente é o remetente, o servidor é o receptor.

Eventos são enviados do remetente usando o método ``emit``. Eventos são recebidos pelo receptor usando o método ``on``, que funciona como um *listener*. Na nossa aplicação iremos utilizar eventos padrões do Socket.IO como ``connection``, ``message`` e ``disconnection``, mas também criaremos eventos personalizados. Aliás, já utilizamos o evento ``connection`` no **index.js**, no qual seu *handler* emite uma mensagem no console sempre que uma nova conexão é estabelecida. 

Na nossa aplicação de bate-papo, seria interessante que os usuários em uma sala fossem notificados do ingresso de um novo usuário na sala. Para isso, vamos usar um evento de **broadcasting**.

**Passo 10** - Notificando a conexão de um novo usuário.


**Broadcasting**

Eventos podem ser transmitidos a partir do servidor usando ``socket.broadcast.emit``. Este evento será enviado para todos os sockets, exceto o que transmitiu o evento (é importante salientar que ``socket`` neste contexto representa uma das conexões para com o servidor). A alteração de código abaixo mostra isso. Quando um novo usuário ingressa no aplicativo de bate-papo, ``socket.broadcast.emit`` é usado para enviar uma mensagem aos demais usuários do chat, notificando-os do ingresso de um novo usuário na sala de bate-papo.

Vamos modificar um pouco o arquivo **src/index.js** para usar `` broadcast.emit``, para isso precisaremos receber um objeto ``socket`` como parâmetro.
 
```javascript
// Monitora novas conexões para Socket.io
io.on('connection', (socket) => {
	// Notifica o ingresso de um novo usuário no bate-papo
	socket.broadcast.emit('message', 'A new user has joined') 
})
```

``socket`` contém informações sobre cada nova conexão. Dessa forma, podemos utilizar métodos do objeto ``socket`` para se comunicar com o cliente que realizou a conexão ou para manipulá-lo. No código acima estamos emitindo um evento do tipo ``broadcast`` que é recebido por todos os clientes/conexões ativas com exceção do remetente (o cliente que acaba de se conectar, representado por ``socket``).

Se iniciarmos o servidor não veremos nenhuma alteração. Para vermos algo realmente acontecer vamos alterar o código do lado do cliente para ficar escutando o evento ``message``.

Em **public/js/chat.js** vamos adicionar o seguinte código:

```javascript
const  socket  =  io()

socket.on('message', (msg) => {
  console.log(msg)
})
``` 

Para testar, podemos abrir quatro instâncias do browser, exibir o console (ativando o modo desenvolvedor) e acessar o endereço **localhost:3000** em cada uma das instâncias.

![enter image description here](https://i.imgur.com/wMRXEvz.gif)

**Passo 11** - Notificando todos os usuários da saída de um usuário.

Vamos adicionar mais um evento na nossa aplicação, desta vez para monitorar as desconexões dos clientes. No nosso aplicativo de bate-papo, essa funcionalidade servirá para notificar os demais membros da sala de bate-papo da saída de um membro específico que fechou o browser ou navegou para outro site.

Vamos modificar mais um pouco o arquivo **src/index.js** adicionando um *listener* para monitorar eventos do tipo ``disconnect`` (i.e., desconexões dos clientes). No nosso aplicativo de bate-papo, esse trecho de código servirá para notificar todos os membros da sala de bate-papo da saída de alguém. 
 
```javascript
// Monitora novas conexões para Socket.io
io.on('connection', (socket) => {
	// Notifica o ingresso de um novo usuário no bate-papo
	socket.broadcast.emit('message', 'A new user has joined!') 

	// Monitora desconexões dos clientes
	socket.on('disconnect', (socket) => {
		// Notifica a saída de um usuário da sala de bate-papo	
		io.emit('message', 'User has left the room!')
	})
})
```

Nossa aplicação de bate-papo deve estar da seguinte maneira:

![enter image description here](https://i.imgur.com/jQVypQo.gif)

Reparem que não estamos usando ``broadcast`` no *handler* de eventos de desconexões, e sim ``io.emit``, que emite o evento do tipo `message` para todos os clientes conectados, incluindo o emissor. Como este evento será emitido quando o emissor sair da sala, não há problema em usá-lo ``io.emit``.

**Passo 12** - Realizando saudação para novos membros do chat.

Agora vamos adicionar uma mensagem de boas vindas para cada novo usuário que se conectar. Essa mensagem será enviada somente para o usuário que estiver se conectando e não será vista pelos demais já conectados à sala de bate-papo.

Em **src/index.js**, adicione:
```javascript
// Monitora novas conexões para Socket.io
io.on('connection', (socket) => {
	// Envia mensagem de boas vindas a um novo usuário que se conectou
	// A mensagem é enviada ao novo usuário (nova conexão), somente
	socket.emit('message', "Welcome!")
	
	// Notifica o ingresso de um novo usuário no bate-papo
	// A mensagem é enviada para todos, exceto para o cliente que socket faz referencia
	socket.broadcast.emit('message', 'A new user has joined!') 

	// Monitora desconexões dos clientes
	socket.on('disconnect', (socket) => {
		// Notifica a saída de um usuário da sala de bate-papo	
		io.emit('message', 'User has left!')
	})
})
```

Nossa aplicação de bate-papo deve estar da seguinte forma:

![enter image description here](https://i.imgur.com/PXuHBcq.gif)

[Arquivos dos passos 10-12.](https://github.com/joaonunesdev/websockets/tree/master/05-Eventos)

# UI
Como o intuito aqui é termos o primeiro contato com os conceitos mais básicos do Socket.io, vamos realizar o "pulo do gato" e copiar alguns arquivos de estilo e html para criar a interface de usuário de nossa aplicação de bate-papo.

**Passo 13** - Criando a interface de usuário.

Sendo assim, copie o seguinte código css para o arquivo **public/css/styles.css**:

```css
/* Estilo Geral */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

html {
	font-size: 16px;
}

input {
	font-size: 14px;
}

body {
	line-height: 1.4;
	color: #333333;
	font-family: Helvetica, Arial, sans-serif;
}

h1 {
	margin-bottom: 16px;
}

label {
	display: block;
	font-size: 14px;
	margin-bottom: 8px;
	color: #777;
}

input {
	border: 1px  solid  #eeeeee;
	padding: 12px;
	outline: none;
}

button {
	cursor: pointer;
	padding: 12px;
	background: #7C5CBF;
	border: none;
	color: white;
	font-size: 16px;
	transition: background  .3s  ease;
}

button:hover {
	background: #6b47b8;
}

button:disabled {
	cursor: default;
	background: #7c5cbf94;
}

/* Estilos da página de Join */
.centered-form {
	background: #333744;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
}

.centered-form__box {
	box-shadow: 0px  0px  17px  1px  #1D1F26;
	background: #F7F7FA;
	padding: 24px;
	width: 350px;
}

.centered-form  button {
	width: 100%;
}

.centered-form  input {
	margin-bottom: 16px;
	width: 100%;
}

/* Layout da página de chat */

.chat {
	display: flex;
}

.chat__sidebar {
	height: 100vh;
	color: white;
	background: #333744;
	width: 225px;
	overflow-y: scroll
}

/* Estilos do Chat */
.chat__main {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	max-height: 100vh;
}

.chat__messages {
	flex-grow: 1;
	padding: 24px  24px  0  24px;
	overflow-y: scroll;
}

/* Estilo das Mensagens */
.message {
	margin-bottom: 16px;
}

.message__name {
	font-weight: 600;
	font-size: 14px;
	margin-right: 8px;
}

.message__meta {
	color: #777;
	font-size: 14px;
}

.message  a {
	color: #0070CC;
}

/* Estilos da Composição de Mensagens */
.compose {
	display: flex;
	flex-shrink: 0;
	margin-top: 16px;
	padding: 24px;
}

.compose  form {
	display: flex;
	flex-grow: 1;
	margin-right: 16px;
}

.compose  input {
	border: 1px  solid  #eeeeee;
	width: 100%;
	padding: 12px;
	margin: 0  16px  0  0;
	flex-grow: 1;
}

.compose  button {
	font-size: 14px;
}

/* Estilo da Sidebar */
.room-title {
	font-weight: 400;
	font-size: 22px;
	background: #2c2f3a;
	padding: 24px;
}

.list-title {
	font-weight: 500;
	font-size: 18px;
	margin-bottom: 4px;
	padding: 12px  24px  0  24px;
}

.users {
	list-style-type: none;
	font-weight: 300;
	padding: 12px  24px  0  24px;
}
```

Agora, copie o seguinte código html para o arquivo **src/index.html**:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Chat App</title>
    <link rel="icon" href="/img/favicon.png" />
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <div class="chat">
      <div id="sidebar" class="chat__sidebar"></div>
      <div class="chat__main">
        <div id="messages" class="chat__messages"></div>

        <div class="compose">
          <form id="message-form">
            <input
              placeholder="Message"
              name="message"
              required
              autocomplet="off"
            />
            <button>Send</button>
          </form>
          <button id="send-location">Send Location</button>
        </div>
      </div>
    </div>

    <script id="message-template" type="text/html">
      <div class="message">
          <p>
              <span class="message__name"> {{ username }}</span>
              <span class="message__meta"> {{ createdAt }} </span>
          </p>
          <p>{{ text }}</p>
      </div>
    </script>

    <script id="location-message-template" type="text/html">
      <div class="message">
            <p>
                <span class="message__name"> {{ username }}</span>
                <span class="message__meta"> {{ createdAt }} </span>
            </p>

            <p> <a href="{{ url }}" target="_blank">My current location</a> </p>
      </div>
    </script>

    <script id="sidebar-template" type="text/html">
      <h2 class="room-title">{{ room }}</h2>
      <h3 class="list-title">Users</h3>
      <ul class="users">
          {{ #users }}
              <li>{{ username }}</li>
          {{ /users }}
      </ul>
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.6.0/qs.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/chat.js"></script>
  </body>
</html>
```

Ao salvar as alterações o nodemon deve reiniciar o servidor e nossa aplicação deve estar da seguinte forma:

![enter image description here](https://lh3.googleusercontent.com/gd4IKeOtUs2dM1m0QV0K3_DlCQIoARIBE4CLZpp08ZrMik7GeAuANkBSSxyFYm5V4O4Q4FzIbvc "UI")

 [Arquivos do passo 13.](https://github.com/joaonunesdev/websockets/tree/master/06-Arquivos_UI)
 
 # Migrando funcionalidades para UI

A partir de agora, vamos utilizar a interface de usuário ao invés do console. Para isso, teremos que refatorar o código existente, começando pelo arquivo **public/js/chat.js**.

**Passo 14** - Refatorando o arquivo js do lado cliente.

Em **public/js/chat.js** vamos refatorar o *handler* para eventos do tipo ``message``, recuperar referências para elementos do **dom** e criar uma função auxiliar temporária que gera nomes aleatórios e que nos ajudará a testar a aplicação enquanto não criamos a join page do chat.

São muitas mudanças que inclusive envolvem alguns conceitos que ainda não foram abordados, mas chegaremos lá.

Antes:

```javascript
const  socket  =  io()

socket.on('message', (msg) => {
  console.log(msg)
})
``` 
Depois:
```javascript
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

``` 

**Recuperando elementos das páginas html**

A abordagem adotada aqui foi capturar referências dos elementos para os quais criaremos algum tipo de interação. Para recuperar estas referências estamos usando o método <a href="https://developer.mozilla.org/pt-BR/docs/Web/API/Document/querySelector" target="_blank">``querySelector``</a> da interface ``document``. 

```javascript
// Recupera os elementos da página de chat
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
```

Alguns elementos do html são na verdade templates. Estamos capturando referências para os mesmos e obtendo a sintaxe HTML com a propriedade <a href="https://developer.mozilla.org/pt-BR/docs/Web/API/Element/innerHTML" target="_blank">``innerHTML``</a> do elemento, que  descreve os elementos descendentes.

```javascript
// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
```

**Usuário ingressa no chat**

Quando um usuário entrar no chat um evento personalizado ``join`` (há também um método join na Socket.io, não confundir nosso evento com o referido método) será emitido. Como vimos posteriormente, para emitir um evento usamos o método ``emit``. O primeiro parâmetro deste método é o nome do evento, no segundo parâmetro estamos passando um objeto que possui o nome do usuário e a sala. Reparem que para o nome de usuário estamos chamando um função que gera um sequência de caracteres aleatória para evitar conflitos de nomes. A sala está *hardcoded*. O último parâmetro que estamos passando é apenas um *callback* para tratar erros.

```javascript
socket.emit('join', { username: generateFakeName(), room: 'virtus1' }, error => {
  if (error) {
    alert(error)
    location.href = '/';
  }
})
```

**Renderizando as mensagens de chat no html**

Antes estávamos apenas exibindo as mensagens no console. A partir de agora vamos renderizar as mensagens na tela de chat usando o sistema de templates <a href="https://www.npmjs.com/package/mustache" target="_blank"> Mustache.js</a>.

```javascript
socket.on('message', ({ username, text, createdAt }) => {
  const html = Mustache.render($messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('h:mm a')
  });
  
  $messages.insertAdjacentHTML('beforeend', html);
})
```

No snippet acima, a função ``Mustache.render`` recebe dois parâmetros: 1) o template mustache e 2) um objeto view com os dados que serão utilizados para renderizar o template. Em seguida, utilizamos ``insertAdjacentHTML`` para adicionarmos o template renderizado *html* em um ponto específico da página, usando a referência. Em outras palavras, o template será renderizado no elemento com id  #messages.

A partir deste momento, todos os eventos do tipo ``message`` usarão este novo *handler*, agora é preciso alterar o código do arquivo **/src/index.js** para que eventos do tipo ``message`` sejam emitidos com o objeto view esperado, ao invés de um texto simples. O novo formato de mensagens possui três propriedades: (i) nome do usuário; (ii) o texto da mensagem; e (iii) a data de criação da mesma.

**Passo 15** -  Refatorando o arquivo js do lado servidor. 

No arquivo **/src/index.js** adicione o seguinte import:

```javascript
const { generateMessage, generateLocationMessage } =  require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
```
Agora vamos utilizar as funções ``generateMessage`` e ``addUser``. No entanto, por fins de praticidade, vamos importar outras funções que serão utilizadas no futuro. 

Dessa forma, vamos criar um *handler* para o evento personalizado ``join``,  que será emitido sempre que alguém se conectar ao chat.

```javascript
// Monitora novas conexões para Socket.io
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
    
    callback() // TODO explicar essa chamada
  })
})
```

Agora vamos entender o que está acontecendo. Sempre que um novo usuário for entrar no sistema ele deve informar o nome de usuário e a sala em que deseja entrar. Mas do lado do servidor o que realmente importa é que este evento possua um objeto no formato ``{ username, room }``.

Com o nome de usuário e a sala, adicionamos um novo usuário na aplicação da seguinte maneira: 

```javascript
 const { error, user } = addUser({ id: socket.id, username, room })
```
Cada conexão do nosso chat possuirá um objeto com um identificador único, um nome e uma sala. Cada conexão no Socket.io possui um identificador aleatório e exclusivo. Utilizaremos este  identificador como id do usuário.

``addUser`` retorna o usuário cadastrado ou um erro, caso algo de errado ocorra.

Se algum erro ocorrer a função de callback passada pelo evento é chamada com o erro. Se não houver nenhum erro o usuário se junta a uma das salas de chat, conforme código abaixo:

```javascript
// Assina o usuário em uma sala
socket.join(user.room)
```

No Socket.io é possível definir canais arbitrários nos quais os sockets podem se conectar com o método ``join`` ou sair com o método ``leave``. Isso se encaixa perfeitamente no conceito de nossa aplicação de chat, no qual as salas são os canais que os usuários podem entrar ou sair. 

Agora podemos encadear os métodos ``to`` ou ``in`` para quando formos emitir ou realizar broadcast de eventos.

No código abaixo primeiro emitimos uma mensagem de boas vindas usando a função ``generateMessage`` que formata a mensagem da forma que o cliente espera (incluindo o timestamp da mensagem). Em seguida, realizamos o broadcast de um evento ``message`` que notifica os demais membros da sala de chat sobre o ingresso de um novo membro. 

Já utilizamos broadcast antes, mas agora estamos encadeando a chamada com outro método ``to`` passando como parâmetro a sala de chat que receberá esta mensagem. Para o Socket.io estamos aqui definindo o canal que receberá a mensagem. No nosso contexto, estamos passando como canal  a sala de bate papo (room) que receberá o evento. 

```javascript
	socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
```

<font color="red">Atenção: </font> É importante salientar mais uma vez para não confundir o método ``socket.join`` com nosso evento personalizado ``join``. O primeiro é chamado para assinar o socket em um determinado canal, o segundo é emitido sempre que alguém abrir a página de chat de nossa aplicação.


Agora vamos alterar um pouco o *handler* que lida com desconexões dos usuários, de modo que este remova o usuário da aplicação por meio da função ``removeUser`` e emita um novo evento tipo ``message`` notificando aos demais membros da sala de chat que determinado membro saiu. 

```javascript
 socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
    }
  })
```

O arquivo **src/index.js** completo deve estar da seguinte forma:

```javascript
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
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

// Monitora novas conexões para Socket.io
io.on('connection', (socket) => {
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

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
    }
  })

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})

``` 

E a aplicação deve estar no seguinte estado:

![enter image description here](https://i.imgur.com/aJiedSq.gif)

[Arquivos dos passos 14-15.](https://github.com/joaonunesdev/websockets/tree/master/07-Migrando_Funcionalidades)

 # Envio de mensagens de texto no chat

Os membros de uma sala de bate-papo devem ser capazes de enviar mensagens, não é mesmo? Um caso de uso que ilustra esta funcionalidade é descrito logo abaixo:

- Usuário clica no input de mensagens e digita a mensagem que deseja enviar.
- Usuário clica no botão "Send" que dispara a mensagem para todos da sala.

**Passo 16** -  Criando a funcionalidade de envio de mensagens no chat.

Vamos continuar trabalhando no arquivo **src/index.js**. Portanto, abra este arquivo e adicione o código abaixo.

```javascript
socket.on('sendMessage', (messageText, callback) => {
    // Recupera o usuário pela id
    const user = getUser(socket.id)
    
    // Envia a mensagem de texto para a sala
    io.to(user.room).emit('message', generateMessage(user.username, messageText))
    
    // Função que confirma o recebimento da mensagem do lado do servidor
    // Socket.io acknowledgement 
    callback()
  })
``` 
Esse *handler* recebe o texto da mensagem e uma função de callback.  Vamos analisar as três linhas de código de forma isolada.

No código abaixo realizamos uma busca na aplicação pelo usuário (que enviou a mensagem) à partir da ``id`` do socket.

```javascript
const user = getUser(socket.id)
```

Com uma instância do usuário em mãos, usamos o código abaixo para emitir um novo evento tipo ``message`` para todos os membros do chat.

 ```javascript
io.to(user.room).emit('message', generateMessage(user.username, messageText))
```

A chamada à função callback  serve apenas para confirmar ao emissor do evento o recebimento do mesmo, funcionando como um *handshake* entre as partes, mas não é obrigatório. No Socket.io isso se chama **acknowledgements** e serve para enviar e receber dados.

```javascript
callback()
```

Agora vamos abrir o arquivo **/public/js/chat.js** e implementar o lado do cliente que ficará responsável por enviar de fato a mensagem. Abra-o e adicione o seguinte código:

```javascript
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
```

[Arquivos do passo 16.](https://github.com/joaonunesdev/websockets/tree/master/08-Mensagens_de_Chat)

 # Envio da localização

As funcionalidades mais básicas do nosso chat estão prontas, falta apenas o envio da localização.

**Passo 17** -  Compartilhando a localização do usuário.

Para enviar a localização do cliente utilizaremos as funcionalidades de geolocalização W3C, que é suportada pela maioria dos browsers.

Para isso, vamos criar um *event listener* no botão "Send Location" e um *handler* para o evento "locationMessage" que deve exibir uma url no chat, de forma semelhante ao envio e recebimento de mensagens regulares do chat.

Portanto, vamos começar adicionando os dois snippets de código abaixo no arquivo **/public/js/chat.js**:

Em **/public/js/chat.js**:
```javascript
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
```
No código acima, quando não houver suporte para a funcionalidade de geolocalização um erro deve ser retornado. Em um fluxo normal, as coordenadas serão extraídas do browser e enviadas à partir da emissão do evento personalizado ``sendLocation``. Mais uma vez estamos desabilitando o botão durante o processo de envio dos dados. Observem que o botão será habilitado apenas quando o callback de ``acknowledgement`` for chamado do lado do servidor, confirmando o recebimento do evento.

O código abaixo, por sua vez, é o *handler* responsável por renderizar as mensagens de localização no chat.

```javascript
// Handler para eventos localização
socket.on('locationMessage', (location) => {
  const html = Mustache.render($locationMessageTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})
```

Agora vamos preparar o lado do servidor para receber a localização do usuário e preparar a mensagem que deve ser enviada para o chat. Dessa forma, vamos copiar o seguinte trecho de código para o arquivo **/src/index.js**.

Em **/src/index.js**:
```javascript
// Recebe a localização do cliente e envia para a sala de chat
  socket.on('sendLocation', (coords, callback) => {
    // Recupera o usuário pela id
    const user = getUser(socket.id)

    // Envia um link do google maps com as coordenadas do cliente
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
    // Função que confirma o recebimento da mensagem do lado do servidor 
    callback()
  })
```

A nossa aplicação deve estar da seguinte maneira:

![enter image description here](https://i.imgur.com/bqCzSuT.gif)

[Arquivos do passo 17.](https://github.com/joaonunesdev/websockets/tree/master/09-Send_Location)


# Sidebar do Chat

Vamos usar a *sidebar* para exibir o nome da sala de chat e a lista de membros do chat. Sempre que um usuário se conectar ou se desconectar um evento deve ser enviado para o client com os dados atualizados da sala. Para isso, vamos adicionar o seguinte código nos *handlers* do evento personalizado ``join``  e do evento padrão ``disconnect``.

**Passo 18** - Implementando a sidebar. 

No arquivo **/src/index.js** adicione o seguinte código dentro dos *handlers* dos eventos ``join`` e ``disconnect``:

```javascript
// Emite evento com dados da sala
io.to(user.room).emit('roomData', {
  room: user.room,
  users: getUsersInRoom(user.room)
})
```

O evento personalizado que estamos emitindo com o código acima se chama ``roomData`` e será enviado sempre à sala específica do usuário. O objeto do evento possui o nome da sala de chat e a lista de membros da mesma.

O arquivo **/src/index.js** deve estar da seguinte forma:

```javascript
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
    
    // Novo código
    // Emite evento com dados da sala
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })
  
  // Recebe uma mensagem do cliente e envia para a sala de chat
  socket.on('sendMessage', (messageText, callback) => {
    // Recupera o usuário pela id
    const user = getUser(socket.id)
    
    // Envia a mensagem de texto para a sala
    io.to(user.room).emit('message', generateMessage(user.username, messageText))
    
    // Função que confirma o recebimento da mensagem do lado do servidor 
    callback()
  })

  // Recebe a localização do cliente e envia para a sala de chat
  socket.on('sendLocation', (coords, callback) => {
    // Recupera o usuário pela id
    const user = getUser(socket.id)

    // Envia um link do google maps com as coordenadas do cliente
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
    // Função que confirma o recebimento da mensagem do lado do servidor 
    callback()
  })

  // Monitora desconexões dos clientes
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    // Notifica a saída de um usuário da sala de bate-papo
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
      
      // Novo código
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
 
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
``` 

Agora só precisamos criar um *handler* para lidar com os eventos do tipo ``roomData`` no arquivo **/public/js/chat.js**, que ficará responsável por renderizar a lista de membros da sala de chat na **sidebar**.

Adicione ao arquivo **/public/js/chat.js** o seguinte trecho de código:

```javascript
// Atualiza os dados da sala (sidebar)
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})
```

Como podemos observar, o evento ``roomData`` contém apenas um objeto com o nome da sala e a lista de usuários. Nossa aplicação deve estar dessa forma agora:

![enter image description here](https://i.imgur.com/1xf6UJL.gif)

[Arquivos do passo 18.](https://github.com/joaonunesdev/websockets/tree/master/10-Sidebar)

# Join Page

Este será o último passo na construção de nossa aplicação de bate-papo, a criação da Join Page. Na nossa aplicação, um usuário entra no chat informando o nome e a sala na qual deseja entrar. Sedo assim, o primeiro componente que o usuário irá interagir na nossa aplicação será um formulário, que quando submetido irá redirecionar o usuário para a respectiva sala de chat. 

**Passo 19** - Criando a Join Page.

Nós já criamos o aquivo **chat.html**, o que precisamos fazer agora é copiar todo o conteúdo de **index.html** para o mesmo. De agora em diante, o arquivo **index.html** será utilizada apenas como porta de entrada para as salas de chat, a Join Page.

Dessa forma, após copiar todo o conteúdo de **index.html** para **chat.html**, copiem o código abaixo para **index.html** (substituindo o conteúdo outrora existente):

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Chat App</title>
    <link rel="icon" href="/img/favicon.png" />
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <div class="centered-form">
      <div class="centered-form__box">
        <h1>Join</h1>
        <form action="/chat.html">
         
          <label>Display name</label>
          <input
            type="text"
            name="username"
            placeholder="Display name"
            required
          />
          
          <label>Room</label>
          <input 
            type="text" 
            name="room" 
            placeholder="Room" 
            required />
          
            <button>Join</button>
        </form>
      </div>
    </div>
  </body>
</html>
```
Os dados do formulário acima descrito serão enviados como *query strings* para o arquivo **chat.html**, que agora carrega o arquivo **/public/js/chat.js**. 

O que precisamos fazer agora é capturar o nome de usuário e a sala para que o usuário seja inserido na sala de chat correta. Para que isso ocorra, precisamos refatorar um pouco o código do arquivo **/public/js/chat.js**, nos livrando da função temporária que cria nomes aleatórios (não precisamos mais dela) e finalmente fazendo uso da biblioteca ``Qs``que importamos diretamente via CDN a um tempo atrás (na verdade, isso nem foi abordado, mas este import estava junto do código que copiamos e colamos). 

Usando a biblioteca ``Qs`` podemos recuperar os campos ``username`` e ``room`` da *query string* resultante da submissão do formulário da Join Page, veja:

```javascript
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
```
No trecho de código acima usamos uma atribuição via desestruturação das variáveis ``username`` e ``room`` fazendo o parse da *query string* através do método ``parse`` da biblioteca ``Qs``. Estamos passando como segundo argumento um objeto de opções com uma opção para ignorar o prefixo **?** da *query string*.

Exemplo:

- A url ``http://localhost:3000/chat.html?username=joao&room=virtus1`` vai resultar em ``username = Joao`` e ``room = virtus1``.

Copie o código abaixo para o arquivo **/public/js/chat.js**:

```javascript
// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
```

E refatore o código que emite o evento ``join`` da seguinte forma:

```javascript
// Evento é emitido sempre que este arquivo for carregado
socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error)
    location.href = '/';
  }
})
```

Nossa aplicação deve estar da seguinte forma:

![enter image description here](https://i.imgur.com/rwuhRo3.gif)


Pronto, nossa aplicação foi concluída. Haja vista a superficialidade deste tutorial, sugiro a leitura da documentação para melhor compreender os conceitos aqui abordados.

[Documentação do Socket.io.](https://socket.io/docs/)

[Arquivos do passo 19.](https://github.com/joaonunesdev/websockets/tree/master/11-Join_Page)