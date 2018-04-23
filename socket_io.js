const config = require('./config_fxcm.js');
const server = require('./server');
const header = require('./sockets_connexion_fxcm');
const axios = require('axios');
const socketIo = require('socket.io');
let querystring = require('query-string');

const requestHead = server.requestHeaders;

const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

const tradinghttp = require(proto);

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

      config.postTrade.amount = data.lot;
      config.postTrade.limit = Number(data.take);
      config.postTrade.is_buy = data.type === "buy" ? true : false;
      config.postTrade.stop = Number(data.stop);
      config.postTrade.symbol = data.currency;

      let postData = querystring.stringify(config.postTrade);
      let resource;

      if(data.rate === 0){
         resource = '/trading/open_trade';
      } else {
        config.postTrade.rate = data.rate;
         resource = '/create_entry_order';
         config.postTrade.order_type = 'Entry';
      }

      let option = {
        host: config.configFxcm.host,
        port: 443,
        method: 'POST',
        path: resource,
        headers: header.requestHeaders
      }

      let req = tradinghttp.request(option, (res) => {
        let result = '';
        res.on('data', function (chunk) {
          result += chunk;
        });
        res.on('end', function () {
          let data = JSON.parse(result);
          io.emit('messageFromServerPostTrade');
        });
        res.on('error', function (err) {
          console.log('Error : ', err);
        })
      }).on('error', function (err) {
        console.log('Req error : ', err);
      });
      req.write(postData);
      req.end();
    })
  });
};

module.exports = {
  listen,
}