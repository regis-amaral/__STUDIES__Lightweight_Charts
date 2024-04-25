const { log, error } = console;
const tulind = require("tulind");
const { promisify } = require("util");

//Promisify Functions
const sma_async = promisify(tulind.indicators.sma.indicator);
const ema_async = promisify(tulind.indicators.ema.indicator);
const macd_async = promisify(tulind.indicators.macd.indicator);

class IndicatorService {
  constructor() {
    this.sma_inc = null;
    this.ema_inc = null;
    this.debug = false;
  }

  async setIndicators(data) {
    this.debugLog("Configurando indicadores");
    data = await this.setEma(data, 17, "ema1");
    data = await this.setEma(data, 72, "ema2");
    data = await this.setEma(data, 200, "ema3");
    data = await this.setMacd(data, 12, 26, 9);
    this.debugLog("Fim: Configurando indicadores");
    return data;
  }

  debugLog(msg) {
    if (this.debug) {
      console.log(msg);
    }
  }

  async setLines(data) {}

  /**
   * Calculates the Simple Moving Average (SMA) for the given data.
   * @param {Array} data - The input data array.
   * @returns {Array} - The modified data array with the SMA values added.
   */
  async setSma(data, period, propertyName) {
    const d1 = data.map((d) => d.close);
    const results = await sma_async([d1], [period]);
    const d2 = results[0];
    const diff = data.length - d2.length;
    const emptyArray = [...new Array(diff)].map((d) => "");
    const d3 = [...emptyArray, ...d2];
    data = data.map((d, i) => {
      const newData = { ...d };
      newData[propertyName] = d3[i];
      return newData;
    });
    return data;
  }

  /**
   * Calculates the Exponential Moving Average (EMA) for the given data.
   * @param {Array} data - The input data array.
   * @returns {Array} - The modified data array with the EMA values added.
   */
  async setEma(data, period, propertyName) {
    const d1 = data.map((d) => d.close);
    const results = await ema_async([d1], [period]);
    const d2 = results[0];
    const diff = data.length - d2.length;
    const emptyArray = [...new Array(diff)].map((d) => "");
    const d3 = [...emptyArray, ...d2];
    data = data.map((d, i) => {
      const newData = { ...d };
      newData[propertyName] = d3[i];
      return newData;
    });
    return data;
  }

  async setMacd(data, shortPeriod, longPeriod, signalPeriod) {
    const d1 = data.map((d) => d.close);
    const results = await macd_async(
      [d1],
      [shortPeriod, longPeriod, signalPeriod]
    );
    const macd = results[0];
    const signal = results[1];
    const histogram = results[2];
    const diff = data.length - macd.length;
    const emptyArray = [...new Array(diff)].map((d) => "");
    const macdArray = [...emptyArray, ...macd];
    const signalArray = [...emptyArray, ...signal];
    const histogramArray = [...emptyArray, ...histogram];
    data = data.map((d, i) => {
      const newData = { ...d };
      newData.macd = macdArray[i];
      newData.signal = signalArray[i];
      newData.histogram = histogramArray[i];
      return newData;
    });
    return data;
  }
}

module.exports = IndicatorService;