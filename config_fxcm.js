const server = require('http').createServer()
const socketIo = require('socket.io')(server);

const configFxcm = {
  token: "faea04378049646b8da5d1616c876214e4a3f8fc",
  host: 'api-demo.fxcm.com',
  port: 443,
  proto: 'https',
  accountId: null
};

let postTrade = {
  "account_id": null,
  "symbol": null,
  "is_buy": null,
  "limit": 0,
  "stop": 0,
  "amount": 0,
  "rate": 0,
  "at_market": 0,
  "is_in_pips": false,
  "order_type": "AtMarket",
  "time_in_force": "GTC"
};

let changeTrade = {
  "order_id": null,
  "limit": 0,
  "is_limit_in_pips": false,
  "stop": 0,
  "is_stop_in_pips": false
};

let closeTrade = {
  "trade_id": null,
  "amount": 0,
  "at_market": 0,
  "order_type": "AtMarket",
  "time_in_force": "GTC",
  "close": "off"
};

let requestHeaders = {
  'User-Agent': 'request',
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
};

let sentData;
let candleRealTime = [];

module.exports = {
  configFxcm,
  postTrade,
  changeTrade,
  closeTrade,
  requestHeaders,
  socketIo,
  server,
  sentData,
  candleRealTime,
};