const { log, error } = console;

class TradeRuler {

  constructor(trades) {
    this.trades = trades;
    // Linhas de suporte e resistencia
    this.topo = null;
    this.base = null;

    this.tradeList = [];
  }

  handle(data) {

   if(this.topo == null ){
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

   return data
  }


  trade(data){
    if (data.close <= (this.topo - (this.topo * 0.0018))) { // 16.520
      this.topo = null;
      this.base = null;
      this.tradeList.push({
        time: data.time,
        price: data.close,
        type: "buy"
      })
      console.log("Comprar ", data.close);
      this.trades.push({ type: "buy", time: data.time, price: data.close });
    }
  }

  
}

module.exports = TradeRuler;