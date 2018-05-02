const config = require('./config_fxcm');
const server = require('./server');
const header = require('./sockets_connexion_fxcm');
const axios = require('axios');
const socketIo = require('socket.io');
let querystring = require('query-string');

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

    socket.on('sendInstrument', (data) => {
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
        params: {
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
      requestTradeSend(data);
    });

    socket.on('sendTradeChange', (data) => {
      /*to do */
    });

    socket.on('closeTrade', (data) => {
      requestTradeSend(data);
    });

    function requestTradeSend(data) {
      let resource;
      let postData;
      let dataModify = data.modify == 'yes' ? 'yes' : 'no';

      if (dataModify == 'yes') {
        config.changeTrade.limit = data.take;
        config.changeTrade.stop = data.stop;

        resource = '/trading/change_trade_stop_limit';
        postData = querystring.stringify(config.changeTrade);

      } else if (data.close == 'on') {
        config.closeTrade.amount = data.amount;
        config.closeTrade.close = data.close;
        resource = '/trading/close_trade';

        postData = querystring.stringify(config.closeTrade);
      } else {
        config.postTrade.amount = data.lot;
        config.postTrade.limit = Number(data.take);
        config.postTrade.is_buy = data.type === "buy" ? true : false;
        config.postTrade.stop = Number(data.stop);
        config.postTrade.symbol = data.currency;

        resource = '/trading/open_trade';
        postData = querystring.stringify(config.postTrade);
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
          console.log(result);
          if (config.closeTrade.close == "on") {
            config.closeTrade.close = "off";
            io.emit('messageFromServerTradeClose');
          } else {
            io.emit('messageFromServerPostTrade');
            getPositionOPen();
          }
        });
        res.on('error', function (err) {
          console.log('Error : ', err);
        })
      }).on('error', function (err) {
        console.log('Req error : ', err);
      });
      req.write(postData);
      req.end();

    };

    function getPositionOPen() {
      let resource = `/trading/get_model`;
      axios({
        url: `${proto}://${host}:${apiPort}${resource}`,
        method: 'GET',
        "params": {
          "models": "OpenPosition",
          "isTotal": true
        },
        headers: header.requestHeaders
      }).then((response) => {
        console.log(response);
        config.closeTrade.trade_id = response.data.open_positions[0].tradeId;
      }).catch((error) => {
        console.log(error)
      })
    };
  });
};

module.exports = {
  listen,
}