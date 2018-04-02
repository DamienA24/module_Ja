const express = require('express');
const config = require('./config_fxcm.js');
const prod = require('./socket_io');
const axios = require('axios');

const app = express();
const server = require('http').Server(app);

const token = config.configFxcm.token;

/* const sockIo = require('socket.io-client');
const host = config.configFxcm.host;
const apiPort = config.configFxcm.port;
const proto = config.configFxcm.proto;
const resource = "/candles/2/m1"; */

/* let requestHeaders = {
  'User-Agent': 'request',
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
}; */

const port = 8080;
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

server.listen(port, () => {
  console.log('server listening on port : ', port)
});

const io = require('socket.io')(server);


/* getConnexionFXCM = (token) => {
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
}; */

prod.getConnexionFXCM(token);

io.on('connection', (socket) => {

  socket.on('sendInstrument', function () {

    prod.getParams()

   /*  axios({
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
    })  */
  })
});


module.exports = {
  server
}