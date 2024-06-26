const { log, error } = console;

const IndicatorService = require("./IndicatorService");
const TradeRuler = require("./TradeRuler");
const BinanceServices = require("./BinanceServices");

class ChartManager {

  constructor(client, startChartTimestamp, transmissionSpeed, maxOpenTrades, percenOfAmount) {
    //
    this.indicatorService = new IndicatorService(); // Instância do serviço de indicadores
    this.binanceServices = new BinanceServices(); // Instância do serviço da Binance
    //
    this.client = client; // Armazena o cliente http
    this.symbol = "BTCUSDT";

    this.startChartTimestamp = startChartTimestamp;
    this.transmissionSpeed = transmissionSpeed;
    this.currentIndex = 0;
    this.dataChart1s = null;
    this.dataChart1m = [];

    this.timer = null;
    this.run = true;
    this.lastCandle = null;

    this.tradeList = [];
    this.tradeRuler = new TradeRuler(this.tradeList, maxOpenTrades, percenOfAmount, startChartTimestamp); // Instância do TradeRuler

    this.debug = false;

    this.preloadingDataChart1m(1000).then(() => {
      this.startFetchingData();
    });
  }

  async preloadingDataChart1m(minutesAgo) {
    try {
      // Calcula o tempo de minutesAgo minutos atrás
      const twentyMinutesInMillis = minutesAgo * 60 * 1000; // minutesAgo minutos em milissegundos
      const startTimeTwentyMinutesAgo =
        this.startChartTimestamp - twentyMinutesInMillis;

      // Busca os dados do mercado na Binance
      let data = await this.binanceServices.getData(
        this.symbol,
        "1m",
        startTimeTwentyMinutesAgo,
        minutesAgo
      );

      // Processamento básico dos dados
      data = this.dataPreprocessing(data);

      // Adiciona indicadores
      data = await this.indicatorService.setIndicators(data);

      // Adiciona ao conjunto de dados de 1m
      this.dataChart1m = data;

      // Envia dados ao cliente
      this.sendResponseWrite(data);

      log("quantidade de registros enviados: ", data.length);
    } catch (e) {
      error("Erro ao precarregar dados do gráfico de 1m", e);
    }
  }

  dataPreprocessing(data) {
    this.debugLog("Processando dados do mercado");
    // Ajusta o tempo para GMT-3
    let setDt = (dt) => {
      let d = new Date(dt);
      return d.setHours(d.getHours() - 3);
    };
    this.debugLog("Fim: Processando dados do mercado");
    return data.map((d) => ({
      time: setDt(d[0]) / 1000,
      date: new Date(setDt(d[0])).toISOString(), //new Date(setDt(d[0])).toLocaleString("pt-BR"),
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
    this.debugLog("Buscando dados do mercado");
    try {
      // Busca os dados do mercado na Binance
      let data = await this.binanceServices.getData(
        this.symbol,
        "1s",
        this.startChartTimestamp,
        1000
      );
      if (data) {
        let klinedata = this.dataPreprocessing(data);
        // Adiciona os dados buscados ao conjunto de dados existentes
        this.dataChart1s = this.dataChart1s
          ? [...this.dataChart1s, ...klinedata]
          : klinedata;
      }
      this.debugLog("Fim: Buscando dados do mercado");
    } catch (e) {
      error("Erro ao buscar dados do gráfico de 1s", e);
    }
  }

  debugLog(msg) {
    if (this.debug) {
      log(msg);
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
      this.debugLog(`Enviando dado do índice ${this.currentIndex}`);

      // encerra a transmissão se a execução foi interrompida pelo App.js
      if (!this.run) {
        clearTimeout(this.timer);
        this.debugLog(`Transmissão encerrada pelo App.js`);
        return;
      }

      try {
        // atualiza um pouco antes de alcançar o fim da lista sem parar a execução do código
        if (this.currentIndex == this.dataChart1s.length - 1000) {
          // Envia novo request com startTime incrementado em 1000 segundos
          this.startChartTimestamp += 1000 * 1000;
          if(this.client){
            this.fetchChartData();
          }else{
            await this.fetchChartData();
          }
          // if (!this.dataChart1s) return;
          // log("Novos dados de mercado recebidos com sucesso");
        }

        let dataToSend = this.dataChart1s[this.currentIndex];

        if(dataToSend == undefined){
          throw new Error("Aguardando dados de mercado para prosseguir"); 
        }

        // Constrói tempo com segundos zerados para candle de 1 minuto
        let date = new Date(dataToSend.time * 1000);
        date.setSeconds(0);
        dataToSend.time = date.getTime() / 1000;

        // Verifica se é um novo candle e recalcula os indicadores do último candle de 1m
        if (this.lastCandle && this.lastCandle.time != dataToSend.time) {
          // Adiciona candle ao conjunto de dados de 1m
          this.dataChart1m.push(this.lastCandle);

          // Recalcula os indicadores para o último candle de 1m
          let r = await this.indicatorService.setIndicators(
            this.dataChart1m.slice(-1000)
          );

          // envia o último candle de 1m com os indicadores atualizados
          this.sendResponseWrite(r[r.length - 1]);
        }

        // Configura dados para envio
        dataToSend = this.configDataToSend(dataToSend);

        // Executa verificação de trades
        dataToSend = await this.tradeRuler.handle(dataToSend);

        // Envia dados formatados
        this.sendResponseWrite(dataToSend);

        this.currentIndex++;

        if(this.client){
          this.timer = setTimeout(sendData, this.transmissionSpeed);
        }else{
          sendData();
        }

        this.debugLog(`Fim: Enviando dado do índice ${this.currentIndex - 1}`);
      } catch (e) {
        log(`Erro: Enviando dado do índice ${this.currentIndex}`);
        error(e);
        if (this.client) {
          this.timer = setTimeout(sendData, this.transmissionSpeed);
        } else {
          sendData();
        }
      }
      
    };

    sendData();
  }

  configDataToSend(dataToSend) {
    this.debugLog("Configurando dados para envio");
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
      // console.log("Novo candle", dataToSend.time, dataToSend.date);
      this.lastCandle = dataToSend;
    }
    this.debugLog("Fim: Configurando dados para envio");
    return this.lastCandle;
  }

  sendResponseWrite(data) {
    if(this.client == null){
      return;
    }
    this.debugLog("Enviando dados ao cliente");
    let J = {
      chart: data,
      trades: this.tradeList,
    };
    this.client.response.write(`data: ${JSON.stringify(J)}\n\n`);
    this.debugLog("Fim: Enviando dados ao cliente");
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
