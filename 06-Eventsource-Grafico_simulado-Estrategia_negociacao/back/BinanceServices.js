const { log, error } = console;
const axios = require("axios");
class BinanceServices {
  constructor() {}

  getApiUrl(symbol, interval, startChartTimestamp, quantity) {
    let url =
      `https://api.binance.com/api/v3/klines?` +
      `symbol=${symbol}&` +
      `interval=${interval}&` +
      `startTime=${startChartTimestamp}&` +
      `limit=${quantity}`;
    return url;
  }

  async getData(symbol, interval, startChartTimestamp, quantity) {
    let t = 0;

    let getD = async (symbol, interval, startChartTimestamp, quantity) => {
      try {
        let url = this.getApiUrl(symbol, interval, startChartTimestamp, quantity);
        const resp = await axios.get(url);
        const data = resp.data;
        return data;
      } catch (err) {
        t += 1;
        if(t < 11){
          log("Tentando novamente em 2 segundos");
           await new Promise((resolve) => setTimeout(resolve, 5000));
           return getD(symbol, interval, startChartTimestamp, quantity);
        }
      }
    };

    return await getD(symbol, interval, startChartTimestamp, quantity);
    
  }
}

module.exports = BinanceServices;