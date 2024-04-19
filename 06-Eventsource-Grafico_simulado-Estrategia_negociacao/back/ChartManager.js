const { log, error } = console;
const axios = require("axios");
const IndicatorService = require("./IndicatorService");

class ChartManager {
  constructor(client, startChartTimestamp, transmissionSpeed) {
    //
    this.indicatorService = new IndicatorService(); // Instância do serviço de indicadores
    //
    this.client = client; // Armazena o cliente http
    this.symbol = "BTCUSDT";
    this.interval = "1s";
    this.startChartTimestamp = startChartTimestamp;
    this.transmissionSpeed = transmissionSpeed;
    this.currentIndex = 0;
    this.dataChart1s = null;
    this.dataChart1m = [];
    
    this.timer = null;
    this.run = true;
    this.lastCandle = null;
    
    this.preloadingDataChart1m(1000).then(() => {
      this.startFetchingData();
    });
  }

  getApiUrl(symbol, interval, startChartTimestamp, quantity) {
    let url =
      `https://api.binance.com/api/v3/klines?` +
      `symbol=${symbol}&` +
      `interval=${interval}&` +
      `startTime=${startChartTimestamp}&` +
      `limit=${quantity}`;
    return url;
  }

  async preloadingDataChart1m(minutesAgo) {
    try{
      // Calcula o tempo de minutesAgo minutos atrás
      const twentyMinutesInMillis = minutesAgo * 60 * 1000; // minutesAgo minutos em milissegundos
      const startTimeTwentyMinutesAgo =
        this.startChartTimestamp - twentyMinutesInMillis;

      let url = this.getApiUrl(
        this.symbol,
        "1m",
        startTimeTwentyMinutesAgo,
        minutesAgo
      );
      const resp = await axios.get(url);
      const data = resp.data;

      let chartData = this.dataPreprocessing(data);

      // adiciona indicadores
      chartData = await this.indicatorService.setIndicators(chartData);

      log("quantidade de registros: ", chartData.length);

      this.dataChart1m = chartData;

      this.client.response.write(
        `data: ${JSON.stringify(this.dataChart1m)}\n\n`
      );
    }catch(e){
      error("Erro ao precarregar dados do gráfico de 1m", e);
    }
  }

  dataPreprocessing(data){
    
    // Ajusta o tempo para GMT-3
    let setDt = (dt) => {
      let d = new Date(dt);
      return d.setHours(d.getHours() - 3);
    };
    
    return data.map((d) => ({
      time: setDt(d[0]) / 1000,
      date: new Date(setDt(d[0])),
      open: d[1] * 1,
      high: d[2] * 1,
      low: d[3] * 1,
      close: d[4] * 1,
      volume: d[5] * 1,
    }));
  }


  /**
   * Busca os dados do mercado na API da Binance
   * @returns {Promise<void>} Uma promise que é resolvida quando os dados do gráfico são buscados com sucesso.
   */
  async fetchChartData() {
    try{
      const resp = await axios.get(
        this.getApiUrl(
          this.symbol,
          this.interval,
          this.startChartTimestamp,
          1000
        )
      );

      const data = resp.data;
      let klinedata = this.dataPreprocessing(data);

      // Adiciona os dados buscados ao conjunto de dados existentes
      this.dataChart1s = this.dataChart1s
        ? [...this.dataChart1s, ...klinedata]
        : klinedata;
    }catch(e){
      error("Erro ao buscar dados do gráfico de " . this.interval, e);
    }
  }

  /**
   * Inicia a busca de dados e os envia periodicamente item a item.
   * @returns {Promise<void>} Uma promise que é resolvida quando a busca e o envio de dados estiverem completos.
   */
  async startFetchingData() {
    // solicita o primeiro conjunto de dados
    await this.fetchChartData();

    if (!this.dataChart1s) return;

    // inicializa o envio de dados
    const sendData = async () => {
      // encerra a transmissão se a execução foi interrompida pelo App.js
      if (!this.run) {
        clearTimeout(this.timer);
        return;
      }

      // atualiza um pouco antes de alcançar o fim da lista sem parar a execução do código
      if (this.currentIndex == this.dataChart1s.length - 100) {
        // Envia novo request com startTime incrementado em 1000 segundos
        this.startChartTimestamp += 1000 * 1000;
        this.apiUrl = this.getApiUrl(this.startChartTimestamp);
        await this.fetchChartData();
        if (!this.dataChart1s) return;
        log("Novos dados de mercado recebidos com sucesso");
      }

      const dataToSend = this.dataChart1s[this.currentIndex];

      // Constrói tempo com segundos zerados para candle de 1 minuto
      let date = new Date(dataToSend.time * 1000);
      date.setSeconds(0);
      dataToSend.time = date.getTime() / 1000;

      try {
        // Verifica se é um novo candle e recalcula os indicadores
        if (this.lastCandle && this.lastCandle.time != dataToSend.time) {
          this.dataChart1m.push(this.lastCandle);
          let r = await this.indicatorService.setIndicators(this.dataChart1m.slice(-200));
          // envia o ultimo candle com o indicador calculado
          this.client.response.write(`data: ${JSON.stringify(r[r.length - 1])}\n\n`);
        }

        // Configura e envia os dados para o cliente
        const formattedData = await this.configDataToSend(dataToSend);
        this.client.response.write(`data: ${formattedData}\n\n`);
        this.currentIndex++;
      } catch (e) {
        log(`Enviando dado do índice ${this.currentIndex}`);
        log(dataToSend);
        error("Erro ao configurar dados:", e);
      }
      this.timer = setTimeout(sendData, this.transmissionSpeed);
    };

    sendData();
  }

  async configDataToSend(dataToSend) {
    
    if (!this.lastCandle) {
      this.lastCandle = {};
    }

    if (this.lastCandle.time == dataToSend.time) {
      // atualiza candle atual
      this.lastCandle.high =
        dataToSend.high > this.lastCandle.high
          ? dataToSend.high
          : this.lastCandle.high;
      this.lastCandle.low =
        dataToSend.low < this.lastCandle.low
          ? dataToSend.low
          : this.lastCandle.low;
      this.lastCandle.close = dataToSend.close;
      this.lastCandle.volume += parseFloat(dataToSend.close);
    } else {
      console.log("Novo candle", dataToSend.time, dataToSend.date);
      this.lastCandle = dataToSend;
    }

    return JSON.stringify(this.lastCandle);
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
