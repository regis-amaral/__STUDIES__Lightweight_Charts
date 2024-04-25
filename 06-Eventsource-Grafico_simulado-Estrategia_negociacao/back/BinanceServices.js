const { log, error } = console;
const axios = require("axios");
const redis = require("redis");
const client = redis.createClient({
  host: "localhost",
  port: 6379
});

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
    const url = this.getApiUrl(symbol, interval, startChartTimestamp, quantity);

    // Verifica se os dados estão em cache no Redis
    const cachedData = await this.getFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    // Se os dados não estiverem em cache, faz a requisição à API
    let data;
    // try {
    //   const response = await axios.get(url);
    //   data = response.data;
    // } catch (error) {
    //   // Lida com erros de requisição à API
    //   console.error("Erro ao obter dados da API:", error);
    //   throw error;
    // }

    let getD = async (data) => {
      try {
        const response = await axios.get(url);
        data = response.data;
      } catch (error) {
        log("Tentando novamente em 2 segundos");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getD(data);
      }
    };
    getD(data);

    // Armazena os dados no cache do Redis
    await this.storeInCache(url, data);

    return data;
  }

  // Método para recuperar dados do cache do Redis
  async getFromCache(url) {
    return new Promise((resolve, reject) => {
      client.get(url, (error, result) => {
        if (error) {
          console.error("Erro ao recuperar dados do cache:", error);
          reject(error);
        } else {
          resolve(result ? JSON.parse(result) : null);
        }
      });
    });
  }

  // Método para armazenar dados no cache do Redis
  async storeInCache(url, data) {
    return new Promise((resolve, reject) => {
      client.set(url, JSON.stringify(data), (error, result) => {
        if (error) {
          console.error("Erro ao armazenar dados no cache:", error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  // async getData(symbol, interval, startChartTimestamp, quantity) {
  //   let t = 0;

  //   let getD = async (symbol, interval, startChartTimestamp, quantity) => {
  //     try {
  //       let url = this.getApiUrl(
  //         symbol,
  //         interval,
  //         startChartTimestamp,
  //         quantity
  //       );
  //       const resp = await axios.get(url);
  //       const data = resp.data;
  //       return data;
  //     } catch (err) {
  //       t += 1;
  //       if (t < 11) {
  //         log("Tentando novamente em 2 segundos");
  //         await new Promise((resolve) => setTimeout(resolve, 5000));
  //         return getD(symbol, interval, startChartTimestamp, quantity);
  //       }
  //     }
  //   };

  //   return await getD(symbol, interval, startChartTimestamp, quantity);
  // }
}

module.exports = BinanceServices;