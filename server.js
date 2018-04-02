const express = require('express');
const config = require('./config_fxcm.js');
const connexionSocket = require('./sockets');

const app = express();
const server = require('http').Server(app);

const token = config.configFxcm.token;

const port = 8080;
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

server.listen(port, () => {
  console.log('server listening on port : ', port)
});

const io = require('socket.io')(server);

connexionSocket.getConnexionFXCM(token);

require('./socket_io')(server);


module.exports = {
  server
}