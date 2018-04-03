const axios = require('axios');
const socketIo = require('socket.io');
const server = require('./server');

const header = require('./sockets_connexion_fxcm');
const config = require('./config_fxcm.js');
const resource = "/trading/get_instruments";
const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

let getData = () => {
  let io = socketIo.listen(server);

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
}

module.exports = {
  getData
}