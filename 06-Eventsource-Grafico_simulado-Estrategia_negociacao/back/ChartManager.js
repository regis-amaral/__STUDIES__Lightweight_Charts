const axios = require("axios");

class ChartManager {
  constructor(response, startChartTimestamp, transmissionSpeed) {
    this.response = response; // Armazena a resposta HTTP
    this.symbol = "BTCUSDT";
    this.interval = "1s";
    this.startChartTimestamp = startChartTimestamp;
    this.transmissionSpeed = transmissionSpeed;
    this.currentIndex = 0;
    this.data = null;
    this.quantity = 1000;
    this.apiUrl = this.getApiUrl(startChartTimestamp);
    this.timer = null;
    this.run = true;
    this.lastCandle = null;
    this.startFetchingData();
  }

  getApiUrl(startChartTimestamp) {
    this.apiUrl =
      `https://api.binance.com/api/v3/klines?` +
      `symbol=${this.symbol}&` +
      `interval=${this.interval}&` +
      `startTime=${startChartTimestamp}&` +
      `limit=${this.quantity}`;
    return this.apiUrl;
  }

  /**
   * Busca os dados do gráfico na API da Binance
   * @returns {Promise<void>} Uma promise que é resolvida quando os dados do gráfico são buscados com sucesso.
   */
  async fetchChartData() {
    try {
      const response = await axios.get(this.apiUrl);
      // Adiciona os dados buscados ao conjunto de dados existentes
      this.data = this.data ? [...this.data, ...response.data] : response.data;
    } catch (error) {
      console.error(`Error fetching chart data: ${error}`);
    }
  }

  /**
   * Inicia a busca de dados e os envia periodicamente item a item.
   * @returns {Promise<void>} Uma promise que é resolvida quando a busca e o envio de dados estiverem completos.
   */
  async startFetchingData() {
    await this.fetchChartData();
    if (!this.data) return;

    const sendData = async () => {
      if (!this.run) {
        clearTimeout(this.timer);
        return;
      }
      // atualiza um pouco antes de alcançar o fim da lista sem parar a execução do código
      if (this.currentIndex == this.data.length - 100) {
        const initialStartTime = Date.now();
        // Envia novo request com startTime incrementado
        this.startChartTimestamp += this.quantity * 1000;
        this.apiUrl = this.getApiUrl(this.startChartTimestamp);
        this.fetchChartData().then(() => {
          if (!this.data) return;
          const finalStartTime = Date.now();
          console.log(
            `Tempo de espera: ${finalStartTime - initialStartTime}ms`
          );
        });
      }
      const dataToSend = this.data[this.currentIndex];
      // Configura e envia os dados para o cliente
      this.response.write(`data: ${this.configDataToSend(dataToSend)}\n\n`);
      console.log(`Enviando dado do índice ${this.currentIndex}`);
      this.currentIndex++;
      this.timer = setTimeout(sendData, this.transmissionSpeed);
    };

    sendData();
  }

  configDataToSend(dataToSend) {
    // Constrói tempo com segundos zerados para candle de 1 minuto
    let date = new Date(dataToSend[6]);
    date.setSeconds(0);
    let time = Math.floor(date.getTime() / 1000);

    let data = null;

    if (!this.lastCandle) {
      this.lastCandle = {};
    }

    if (this.lastCandle.time == time) {
      // atualiza candle atual
      this.lastCandle.high =
        dataToSend[2] > this.lastCandle.high
          ? dataToSend[2]
          : this.lastCandle.high;
      this.lastCandle.low =
        dataToSend[3] < this.lastCandle.low
          ? dataToSend[3]
          : this.lastCandle.low;
      this.lastCandle.close = dataToSend[4];
      this.lastCandle.volume += parseFloat(dataToSend[5]);
    } else {
      console.log("Novo candle", time);
      this.lastCandle.time = time;
      this.lastCandle.open = dataToSend[1];
      this.lastCandle.high = dataToSend[2];
      this.lastCandle.low = dataToSend[3];
      this.lastCandle.close = dataToSend[4];
      this.lastCandle.volume = parseFloat(dataToSend[5]);
    }

    data = {
      date: this.lastCandle.time,
      open: this.lastCandle.open,
      high: this.lastCandle.high,
      low: this.lastCandle.low,
      close: this.lastCandle.close,
      volume: this.lastCandle.volume,
    };

    return JSON.stringify(data);
  }

  stop() {
    if (this.run) {
      this.run = false;
      console.log("Transmissão encerrada");
    }
  }

}

module.exports = ChartManager;

// [
//   [
//     1499040000000, // Kline open time
//     "0.01634790", // Open price
//     "0.80000000", // High price
//     "0.01575800", // Low price
//     "0.01577100", // Close price
//     "148976.11427815", // Volume
//     1499644799999, // Kline Close time
//     "2434.19055334", // Quote asset volume
//     308, // Number of trades
//     "1756.87402397", // Taker buy base asset volume
//     "28.46694368", // Taker buy quote asset volume
//     "0", // Unused field, ignore.
//   ],
// ];
