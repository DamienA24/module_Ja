const resource = "/trading/get_instruments";
const config = require('./config_fxcm.js');
const server = require('./server');
const axios = require('axios');
const sockIo = require('socket.io-client')
const io = require('socket.io')(server.server);
let data;

const requestHead = server.requestHeaders;


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
  });
  socket.on('connect_error', (error) => {
    console.log('Socket.IO session connect error: ', error);
  });
  // fired when socket.io cannot connect (login errors)
  socket.on('error', (error) => {
    console.log('Socket.IO session error: ', error);
  });
};


let getParams = () => {
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
}


module.exports = {
  getParams,
  getConnexionFXCM
}