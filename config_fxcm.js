const configFxcm = {
  token: "58c8207fa6f1b45d829018f3306fec83e9bdae12", // get this from http://tradingstation.fxcm.com/
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