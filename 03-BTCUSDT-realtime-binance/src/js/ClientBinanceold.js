import WebSocket from "ws";

class ClientBinance {
  constructor() {
    this.observers = [];
    this.url = "wss://stream.binance.com:9443/ws/btcusdt@kline_1s";
    this.restartTime = 60 * 60 * 10000; // Restart a cada 10 horas
    this.timer = null;
    this.ws = null;
    this.connect();
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(message) {
    for (let observer of this.observers) {
      observer.update(message);
    }
  }

  connect() {
    try {
      console.log("Conectando a Binace WebSocket");
      this.ws = new WebSocket(this.url);

      this.ws.on("open", () => {
        this.timer = setTimeout(() => {
          this.restart(this.ws);
        }, this.restartTime);
        console.log("Conexão estabelecida");
      });

      this.ws.on("message", function incoming(data) {
        console.log(JSON.parse(data));
      });

      this.ws.on("close", () => {
        clearTimeout(this.timer);
        console.log("Conexão encerrada");
        this.connect();
      });
    } catch (error) {
      console.error(`Error starting WebSocket: ${error}`);
    }
  }

  restart(ws) {
    try {
      this.ws.close();
    } catch (error) {
      console.error(`Error restarting WebSocket: ${error}`);
    }
  }
}

export default ClientBinance;