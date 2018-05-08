const connexionSocket = require('./sockets_connexion_fxcm');
const config = require('./config_fxcm.js');
const express = require('express');

const app = express();
const server = require('http').Server(app);

const token = config.configFxcm.token;

const port = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

server.listen(port, () => {
  console.log('server listening on port : ', port)
});

connexionSocket.getConnexionFXCM(token);
require('./socket_io').listen(server);
require('./price_updates').listenPrice(server);

module.exports = {
   server,
 }