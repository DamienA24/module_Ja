const querystring = require('query-string');
const config = require('./config_fxcm');
const https = require('https');

let listenPrice = (socket, io) => {
  let sock = socket;

  io.on('connection', (socket) => {

    socket.on('realTime', () => {
      suscribePrices(sock);
    });

    let suscribePrices = (socket) => {
      let pairs = {
        "pairs": ["EUR/USD", "AUD/USD", "GBP/CAD", "EUR/JPY"]
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
        sendpriceUpdate(jsonData.Updated, jsonData.Symbol, jsonData.Rates);
      } catch (e) {
        console.log('price update JSON parse error: ', e);
        return;
      }
    };

    let sendpriceUpdate = (time, pair, rate) => {
      let priceObj = {};
      let date = new Date(time);
      let newDate = date.getMinutes();
      let newDateSeconds = date.getSeconds();

      priceObj.data = config.candleRealTime;

      if (config.candleRealTime[5] === pair) {
        priceObj.rate = Number(rate[0]);
        priceObj.ask = Number(rate[1]);
        if (priceObj.rate > config.candleRealTime[1] || priceObj.rate < config.candleRealTime[1]) {
          config.candleRealTime[1] = priceObj.rate;
        } else if (priceObj.rate > config.candleRealTime[2]) {
          config.candleRealTime[2] = priceObj.rate;
        } else if (priceObj.rate < config.candleRealTime[3]) {
          config.candleRealTime[3] = priceObj.rate;
        }
      }

      if (newDate === 0 && newDateSeconds > 5 && config.candleRealTime[4] === 'h1' && config.candleRealTime[6] === 'off') {
        updateDataNewCandle(priceObj.data, priceObj.rate);
      } else if (newDate === 30 || newDate === 0 && newDateSeconds > 5 && config.candleRealTime[4] === 'm30' && config.candleRealTime[6] === 'off') {
        updateDataNewCandle(priceObj.data, priceObj.rate)
      } else if (newDate != 0 && newDate != 30) {
        config.candleRealTime[6] = 'off'
      }
      if (priceObj.hasOwnProperty('rate')) {
        io.emit('ServerSendRealTime', priceObj);
      }
    };

    let updateDataNewCandle = (oldData, newPrice) => {
      oldData[0] = oldData[1];
      config.candleRealTime[6] === 'on'

      for (let i = 1; i < oldData.length - 3; i++) {
        oldData[i] = newPrice;
      }
      return oldData;
    };
  });
};

module.exports = {
  listenPrice,
};