const sockIo = require('socket.io-client');
const config = require('./config_fxcm.js');
const axios = require('axios');
const ioTest = require('./config_fxcm').io;

const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;
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
    require('./price_updates').listenPrice(socket, ioTest);
  });
  socket.on('connect_error', (error) => {
    console.log('Socket.IO session connect error: ', error);
  });
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
  getAccountId,
};