/**
* Gera uma mensagem do chat.
*
* A mensagem contém o nome do usuário, o texto da mensagem
* e a data da criação da mensagem.
*
* @param  {string}  username
* @param  {string}  text
*/
const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
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
const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}
