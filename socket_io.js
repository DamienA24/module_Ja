const config = require('./config_fxcm.js');
const server = require('./server');
const header = require('./sockets_connexion_fxcm');
const axios = require('axios');
const socketIo = require('socket.io');

const requestHead = server.requestHeaders;

const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

const prott = require(proto);

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
      let resource = '/trading/open_trade';

      config.postTrade.amount = data.lot;
      config.postTrade.limit = Number(data.take);
      config.postTrade.is_buy = data.type === "buy" ? true : false;
      config.postTrade.stop = Number(data.stop);
      config.postTrade.symbol = data.currency;

      axios({
        url: `${proto}://${host}:${apiPort}${resource}`,
        method: 'POST',
        "params": config.postTrade,
        headers: header.requestHeaders
      }).then((response) => {
        let sentData = response;
      }).catch((error) => {
        console.log(error)
      })
    })
  });
};

module.exports = {
  listen,
}