const resource = "/trading/get_instruments";
const config = require('./config_fxcm.js');
const server = require('./server');
const header = require('./sockets');
const axios = require('axios');
const socketIo = require('socket.io');

const requestHead = server.requestHeaders;

const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

let listen = (server) => {
  let io = socketIo.listen(server);

  io.on('connection', (socket) => {

    socket.on('sendInstrument', function () {
      axios({
        url: `${proto}://${host}:${apiPort}${resource}`,
        method: 'GET',
        "params": {
          "num": 10
        },
        headers: header.requestHeaders
      }).then((response) => {
        let data = response.data;
        io.emit('messageFromServer', data);
      }).catch((error) => {
        console.log(error)
      })  
    })
  });
};

module.exports = {
  listen
}