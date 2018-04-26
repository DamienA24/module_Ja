const sockIo = require('socket.io-client');
const config = require('./config_fxcm.js');
const https = require('https');
const axios = require('axios');

const token = config.configFxcm.token;
const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;

let requestHeaders = {
  'User-Agent': 'request',
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
};

let getConnexionFXCM = (token) => {
  let socket = sockIo(proto + '://' + host + ':' + apiPort, {
    query: {
      access_token: token
    }
  });
  socket.on('connect', () => {
    console.log('Socket.IO session has been opened: ', socket.id);
    requestHeaders.Authorization = 'Bearer ' + socket.id + token;
    getAccountId();
  });
  socket.on('connect_error', (error) => {
    console.log('Socket.IO session connect error: ', error);
  });
  // fired when socket.io cannot connect (login errors)
  socket.on('error', (error) => {
    console.log('Socket.IO session error: ', error);
  });
};

let getAccountId = () => {
  let resource = `/trading/get_model`;
  axios({
    url: `${proto}://${host}:${apiPort}${resource}`,
    method: 'GET',
    "params": {
      "models": ["Account"]
    },
    headers: requestHeaders
  }).then((response) => {
    config.configFxcm.accountId = response.data.accounts[0].accountId;
    config.postTrade.account_id = response.data.accounts[0].accountId;
    suscribeTable();
  }).catch((error) => {
    console.log(error)
  })
};

let suscribeTable = () => {

  let subscribe = ` {"tables":["Order","OpenPosition"]}`;

  let option = {
    host: config.configFxcm.host,
    port: 443,
    method: 'POST',
    path: '/trading/subscribe',
    headers: requestHeaders
  };

  let req = https.request(option, (res) => {
    let result = '';
    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function () {
      console.log(result);
    });
    res.on('error', function (err) {
      console.log('Error : ', err);
    })
  }).on('error', function (err) {
    console.log('Req error : ', err);
  });
  req.write(subscribe);
  req.end();
};

module.exports = {
  getConnexionFXCM,
  getAccountId,
  requestHeaders
}