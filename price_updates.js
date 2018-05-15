const querystring = require('query-string');
const config = require('./config_fxcm');
const server = require('./server');
const socketIo = require('socket.io');
const https = require('https');

let listenPrice = (socket, io) => {
  let sock = socket;

  io.on('connection', (socket) => {

     socket.on('test2', () => {
      suscribePrices(sock);
    });

    let suscribePrices = (socket) => {
      let pairs = {
        "pairs": ["EUR/USD", "AUD/USD"]
      };
      let postData = querystring.stringify(pairs);
      let option = {
        host: config.configFxcm.host,
        port: 443,
        method: 'POST',
        path: '/subscribe',
        headers: config.requestHeaders
      };

      let req = https.request(option, (res) => {
        let result = '';
        res.on('data', function (chunk) {
          result += chunk;
        });
        res.on('end', function () {
          let jsonData = JSON.parse(result);
          for (var i in jsonData.pairs) {
            socket.on(jsonData.pairs[i].Symbol, priceUpdate);
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

    let priceUpdate = (update) => {
      try {
        let jsonData = JSON.parse(update);

        jsonData.Rates = jsonData.Rates.map(function (element) {
          return element.toFixed(5);
        });
/*         console.log(`@${jsonData.Updated} Price update of [${jsonData.Symbol}]: ${jsonData.Rates}`);
 */        sendpriceUpdate(jsonData.Updated, jsonData.Symbol, jsonData.Rates);
      } catch (e) {
        console.log('price update JSON parse error: ', e);
        return;
      }
    };

    let sendpriceUpdate = (time, pair, rate) => {
      let priceObj = {};
      priceObj.rate = rate[1];
      priceObj.pair = pair;

      io.emit('test2', priceObj);
    };
  });
};

module.exports = {
  listenPrice,
};