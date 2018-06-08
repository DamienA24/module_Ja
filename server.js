const connexionSocket = require('./sockets_connexion_fxcm');
const config = require('./config_fxcm.js');
const path = require('path');

const app = require('./config_fxcm').app;
const express = require('./config_fxcm').express
const server = require('./config_fxcm').server;
let io = require('./config_fxcm').io;

const token = config.configFxcm.token;

const port = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(port, () => {
  console.log('server listening on port : ', port)
});

connexionSocket.getConnexionFXCM(token);
require('./socket_io').listen(io);

module.exports = {
   server,
}