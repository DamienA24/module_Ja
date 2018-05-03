const configFxcm = {
  token: "a1262fae0f94fd916143398e99cc89c6acd80795",
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

module.exports = {
  configFxcm,
  postTrade,
  changeTrade,
  closeTrade,
  requestHeaders
};