const { log, error } = console;
const tulind = require("tulind");
const { promisify } = require("util");

//Promisify Functions
const sma_async = promisify(tulind.indicators.sma.indicator);
const ema_async = promisify(tulind.indicators.ema.indicator);

class IndicatorService {
  constructor() {
    this.sma_inc = null;
    this.ema_inc = null;
  }

  async setIndicators(data) {
    data = await this.setEma(data, 17, "ema1");
    data = await this.setEma(data, 72, "ema2");
    data = await this.setEma(data, 200, "ema3");
    return data;
  }

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
}

module.exports = IndicatorService;