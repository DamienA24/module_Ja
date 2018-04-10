/* const resource = "/trading/get_instruments";
 */
const config = require('./config_fxcm.js');
const server = require('./server');
const header = require('./sockets_connexion_fxcm');
const axios = require('axios');
const socketIo = require('socket.io');

const requestHead = server.requestHeaders;

const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

const devises = {
  'EUR/USD': '1',
  'AUD/USD': '6',
  'EUR/JPY': '10',
  'GBP/CAD': '20',
}

let listen = (server) => {
  let io = socketIo.listen(server);

  io.on('connection', (socket) => {

    socket.on('sendInstrument', function (data) {
      let recoverdData = data;

      for (let props in devises) {
        if (recoverdData.currency == props) {
          recoverdData.currency = devises[props];
          break;
        };
      };

      let resource = `/candles/${recoverdData.currency}/${recoverdData.interval}`;
      axios({
        url: `${proto}://${host}:${apiPort}${resource}`,
        method: 'GET',
        "params": {
          "num": 351
        },
        headers: header.requestHeaders
      }).then((response) => {
        let sentData = response.data;
        io.emit('messageFromServer', sentData);
      }).catch((error) => {
        console.log(error)
      })
    })

      socket.on('sendTrade', (data) => {
      let resource = data;
      axios({
        url: `${proto}://${host}:${apiPort}${resource}`,
        method: 'GET',
        "params": {
          "models": ["Account"]
        },    
        headers: header.requestHeaders
      }).then((response) => {
        let sentData = response.data;
      }).catch((error) => {
        console.log(error)
      })
    })  
  });
};

module.exports = {
  listen,
}