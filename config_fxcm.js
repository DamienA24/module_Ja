const socketIo = require('socket.io');
const express = require('express');
const app = express();
const server = require('http').Server(app);
let io = socketIo.listen(server);

const configFxcm = {
  token: "8524f4a5ec96cd6f513cc8d9a85d23870babc5a9",
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
  io,
  app,
  express,
  server,
  sentData,
  candleRealTime,
};