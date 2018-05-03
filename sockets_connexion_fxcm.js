const updatePrice = require('./price_updates');
const querystring = require('query-string');
const sockIo = require('socket.io-client');
const config = require('./config_fxcm.js');
const axios = require('axios');

const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;
const token = config.configFxcm.token;
const host = config.configFxcm.host;


let getConnexionFXCM = (token) => {
  let socket = sockIo(proto + '://' + host + ':' + apiPort, {
    query: {
      access_token: token
    }
  });
  socket.on('connect', () => {
    console.log('Socket.IO session has been opened: ', socket.id);
    config.requestHeaders.Authorization = 'Bearer ' + socket.id + token;
    getAccountId();
    updatePrice.suscribePrices(socket);
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
    headers: config.requestHeaders
  }).then((response) => {
    config.configFxcm.accountId = response.data.accounts[0].accountId;
    config.postTrade.account_id = response.data.accounts[0].accountId;
  }).catch((error) => {
    console.log(error)
  })
};

module.exports = {
  getConnexionFXCM,
  getAccountId
};