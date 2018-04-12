const configFxcm = {
  token: "aa448cb49965418d20beca094946ffaec45fd251", // get this from http://tradingstation.fxcm.com/
  host: 'api-demo.fxcm.com',
  port: 443,
  proto: 'https',
  accountId: null
}

const postTrade = {
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
}

module.exports = {
  configFxcm,
  postTrade
};