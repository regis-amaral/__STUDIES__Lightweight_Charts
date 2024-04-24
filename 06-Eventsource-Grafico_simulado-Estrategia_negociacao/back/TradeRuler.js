const { log, error } = console;

class TradeRuler {
  constructor(tradeList) {
    this.tradeList = tradeList;

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
    
  }

  handle(data) {
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

    this.trade(data);

    return data;
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
  buyBtc(time, trigger, price, percent_target, percent_stop, usd, date) {
    let btcUnits = this.calculateUsd1perctFromBalance(price);
    // não compra se não houver saldo
    if(btcUnits == 0){
      return null;
    }
    // reduz do saldo em usd
    this.usdBalance =  this.usdBalance - btcUnits * price;
    // aumenta o saldo em btc
    this.btcBalance = this.btcBalance + btcUnits;
    // retorna o objeto de posição de trade
    return {
      id: this.tradeList.length + 1,
      date: date,
      trigger: trigger,
      percent: percent_target,
      time: time,
      price: price,
      target: Math.ceil(price + price * percent_stop),
      status: "open", // "open", "closed", "canceled",
      btcUnits: btcUnits,
      profit: 0,
      fee: 0,
      usdBalance: this.usdBalance.toFixed(2) * 1,
      btcBalance: this.btcBalance.toFixed(5) * 1,
      totalBalance: (this.usdBalance + this.btcBalance * price).toFixed(2) * 1,
      opentrades: this.openTrades,
      sellDate: null,
    };
  }

  sellBtc(trade, price, date) {
    // aumenta o saldo em usd
    this.usdBalance = this.usdBalance + (trade.btcUnits * price);
    // reduz saldo em btc
    this.btcBalance = this.btcBalance - trade.btcUnits;
    //
    this.openTrades = this.openTrades - 1;
    trade.status = "closed";
    trade.profit = (
      trade.btcUnits * price -
      (trade.btcUnits * trade.price + trade.fee)
    ).toFixed(2) * 1;
    trade.usdBalance = (this.usdBalance).toFixed(2) * 1,
    trade.btcBalance = (this.btcBalance).toFixed(5) * 1,
    trade.totalBalance = (this.usdBalance + this.btcBalance * price).toFixed(2) * 1,
    trade.opentrades = this.openTrades;
    trade.sellDate = date;
    console.log("Vendido ", trade);
  }

  calculateUsd1perctFromBalance(price){
    let q = 0;
    //calcula a quantidade de trades abertos
    this.tradeList.forEach((t) => {
      if (t.status == "open") {
        q += 1;
      }
    });
    
    if(q == 100){
      return 0;
    }
    this.openTrades = q + 1;
    // quantidade mínima possível para compra em btc
    let minBtc = Math.ceil(5 / (price / 100000)) / 100000;
    // quantidade mínima possível em dólar
    let minUsd = minBtc * price;
    // valor mínimo de saldo em usd disponível para compra de btc, 1% do salto inicial em cada compra
    let usd = this.usdBalance / (100 - q);
    // valor final da compra em unidade de BTC
    let btcUnits = usd > minUsd ? usd : minUsd;
    btcUnits = (btcUnits / price).toFixed(5);
    return btcUnits * 1;
  }

  trade(data) {
    let percent = 0.005; // 0.01 = 1%

    let targetprice = percent + (percent * 0.5);

    // Quando o preço de fechamento se afastar x% do this.topo anterior ou x% do this.lastTradePrice anterior
    if (data.close <= this.topo - this.topo * percent || data.close <= this.lastTradePrice - this.lastTradePrice * percent) {

      let t = this.buyBtc(
        data.time,
        this.topo,
        data.close,
        percent,
        targetprice,
        this.usdBalance * 0.01,
        data.date
      );

      // reseta indicadores
      this.topo = null;
      this.base = null;
      this.lastTradePrice = data.close;

      // não compra se não houver saldo
      if(t == null){
        return;
      }
      
      // Faz a compra
      this.tradeList.push(t);
      
      console.log("Comprado ", t);
    }

    // VENDER QUANDO ATINGIR O TARGET
    this.tradeList.forEach((t) => {
      if (t.status == "open" && data.close >= t.target) {
        this.sellBtc(t, data.close, data.date);
      }
    });



  }
}

module.exports = TradeRuler;