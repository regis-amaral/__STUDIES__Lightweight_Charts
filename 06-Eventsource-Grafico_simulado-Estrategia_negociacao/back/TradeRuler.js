const { log, error } = console;
const DB = require("./DB");

class TradeRuler {
  constructor(tradeList, maxOpenTrades, percenOfAmount) {
    this.db = new DB();
    this.tradeList = tradeList;
    this.maxOpenTrades = maxOpenTrades ?? 50;
    this.percenOfAmount = percenOfAmount ?? 0.01; // 0.01 = 1%

    // Linhas de suporte e resistencia
    this.topo = null;
    this.base = null;

    this.lastTradePrice = null;

    // Saldos
    this.usdBalance = 1000;
    this.btcBalance = 0;

    // Taxas totais
    this.totalFees = 0;

    // Trades abertos
    this.openTrades = 0;

    // Debug log
    this.debug = false;
  }

  async handle(data) {
    this.debugLog("Iniciando processamento trade ruler");
    if (this.topo == null) {
      this.topo = data.high;
    }
    if (this.base == null) {
      this.base = data.low;
    }

    // Move a linha de fundo e topo conforme os dados
    this.topo = !data.high || this.topo > data.high ? this.topo : data.high;
    data["line_top"] = this.topo;
    this.base = !data.low || this.base < data.low ? this.base : data.low;
    data["line_base"] = this.base;

    await this.trade(data);
    this.debugLog("Fim: Iniciando processamento trade ruler");
    return data;
  }

  debugLog(msg) {
    if (this.debug) {
      console.log(msg);
    }
  }

  /**
   * Creates a new buy trade object.
   *
   * @param {string} time - The time of the trade.
   * @param {string} trigger - The trigger for the trade.
   * @param {number} price - The price of the trade.
   * @param {number} percent_target - The target percentage for the trade.
   * @returns {object} - The newly created buy trade object.
   */
  buyBtc(time, trigger, price, percent_target, percent_stop, date) {
    this.debugLog("Compra BTC");
    let units = this.calculateUsdPerctFromBalance(price);
    // não compra se não houver saldo
    if (units == 0) {
      return null;
    }
    // reduz do saldo em usd
    this.usdBalance = this.usdBalance - (units * price).toFixed(2) * 1;
    // aumenta o saldo em btc
    this.btcBalance = this.btcBalance + units;
    // calcula o total
    this.totalBalance =
      this.usdBalance + (this.btcBalance * price).toFixed(2) * 1;

    this.debugLog("Fim: Compra BTC");

    // retorna o objeto de posição de trade
    return {
      id: this.tradeList.length + 1,
      date: date,
      trigger: trigger,
      percent: percent_target,
      target: Math.ceil(price + price * percent_stop),
      status: "open", // "open", "closed", "canceled",
      profit: 0,
      fee: 0,
      usdBalance: this.usdBalance,
      btcBalance: this.btcBalance,
      totalBalance: this.totalBalance,
      opentrades: this.openTrades,
      buy: {
        time: time,
        price: price,
        units: units,
      },
      sell: {
        time: null,
        price: null,
        units: null,
      },
    };
  }

  sellBtc(trade, time, units, price) {
    this.debugLog("Venda BTC");
    // aumenta o saldo em usd
    this.usdBalance = this.usdBalance + (units * price).toFixed(2) * 1;
    // reduz saldo em btc
    this.btcBalance = this.btcBalance - units;
    // calcula o total
    this.totalBalance =
      this.usdBalance + (this.btcBalance * price).toFixed(2) * 1;

    this.openTrades = this.openTrades - 1;
    trade.status = "closed";
    trade.profit =
      (units * price - (trade.buy.units * trade.buy.price + trade.fee)).toFixed(
        2
      ) * 1;
    //trade.usdBalance = this.usdBalance,
    //trade.btcBalance = this.btcBalance,
    //trade.totalBalance = this.totalBalance,
    // trade.opentrades = this.openTrades;
    trade.sell.time = time;
    trade.sell.price = price;
    trade.sell.units = units;

    console.log("Vendido ", trade);
    this.debugLog("Fim: Venda BTC");
  }

  calculateUsdPerctFromBalance(price) {
    this.debugLog("Calculando quantidade de BTC para compra");
    let q = 0;
    //calcula a quantidade de trades abertos
    this.tradeList.forEach((t) => {
      if (t.status == "open") {
        q += 1;
      }
    });

    if (q == maxOpenTrades) {
      return 0;
    }

    this.openTrades = q + 1;
    // quantidade mínima possível para compra em btc
    let minBtc = Math.ceil(5 / (price / 100000)) / 100000;
    // quantidade mínima possível em dólar
    let minUsd = minBtc * price;
    // valor mínimo de saldo em usd disponível para compra de btc, 1% do salto inicial em cada compra
    // let usd = this.usdBalance / (100 - q);
    let usd = this.usdBalance / (this.maxOpenTrades - q);
    // valor final da compra em unidade de BTC
    let btcUnits = usd > minUsd ? usd : minUsd;
    btcUnits = (btcUnits / price).toFixed(5) * 1;
    this.debugLog("Fim: Calculando quantidade de BTC para compra");
    return btcUnits * 1;
  }

  async trade(data) {
    this.debugLog("Iniciando verificação de trade");


    let targetprice = this.percenOfAmount + this.percenOfAmount * 0.5;

    // Quando o preço de fechamento se afastar x% do this.topo anterior ou x% do this.lastTradePrice anterior
    if (
      //(this.lastTradePrice && data.close < (this.lastTradePrice - (this.lastTradePrice * this.percenOfAmount))) || // x% abaixo do último preço de compra
      (this.lastTradePrice &&
        data.close < this.topo - this.topo * this.percenOfAmount &&
        data.close < this.lastTradePrice - this.lastTradePrice * 0.0005) || // x% abaixo do topo e x% abaixo do último preço de compra
      (this.lastTradePrice == null &&
        data.close < this.topo - this.topo * this.percenOfAmount) // x% abaixo do topo
    ) {
      // impedir que um novo trader seja criado se houver um trader em aberto no último mínuto
      let lastTrade = this.tradeList[this.tradeList.length - 1];
      if (
        lastTrade &&
        lastTrade.status == "open" &&
        lastTrade.buy.time == data.time
      ) {
        return;
      }

      let t = this.buyBtc(
        data.time,
        this.topo,
        data.close,
        this.percenOfAmount,
        targetprice,
        data.date
      );

      // reseta indicadores
      this.topo = null;
      this.base = null;
      this.lastTradePrice = data.close;

      // não compra se não houver saldo
      if (t == null) {
        return;
      }

      // Faz a compra
      this.tradeList.push(t);

      console.log("Comprado ", t);

      this.db.saveOrUpdate(t);
    }

    // VENDER QUANDO ATINGIR O TARGET
    this.tradeList.forEach((t) => {
      if (t.status == "open" && data.close >= t.target) {
        this.sellBtc(t, data.time, t.buy.units, data.close);

        this.db.saveOrUpdate(t);

        this.lastTradePrice = null;
      }
    });
    this.debugLog("Fim: Iniciando verificação de trade");
  }
}

module.exports = TradeRuler;