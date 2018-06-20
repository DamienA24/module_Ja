const connexionSocket = require('./sockets_connexion_fxcm');
const config = require('./config_fxcm.js');

const server = require('./config_fxcm').server;
const io = require('./config_fxcm').socketIo;

const token = config.configFxcm.token;

server.listen(8080);

connexionSocket.getConnexionFXCM(token);
require('./socket_io').listen(io);

module.exports = {
   server,
}