const resource = "/trading/get_instruments";
const config = require('./config_fxcm.js');
const server = require('./server');
const header = require('./sockets');
const axios = require('axios');
const io = require('socket.io')(server.server);

const requestHead = server.requestHeaders;

const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

io.on('connection', (socket) => {

  socket.on('sendInstrument', function () {
    axios({
      url: `${proto}://${host}:${apiPort}${resource}`,
      method: 'GET',
      "params": {
        "num": 10
      },
      headers: requestHeaders
    }).then((response) => {
      let data = response.data;
      io.emit('messageFromServer', data);
    }).catch((error) => {
      console.log(error)
    })  
  })
});



module.exports = {
  
}