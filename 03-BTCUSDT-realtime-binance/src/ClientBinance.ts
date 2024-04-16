import WebSocket from 'ws';

interface Observer {
  update: (data: any) => void;
}

class ClientBinance {
  private observers: Observer[];
  private ws;
  private url;
  private restartTime;
  private timer: NodeJS.Timeout | null;

  constructor() {
    this.observers = [];
    this.url = "wss://stream.binance.com:9443/ws/btcusdt@kline_1s";
    this.restartTime = 60 * 60 * 10000; // Restart a cada 10 horas
    this.timer = null;
    this.ws = new WebSocket(this.url);
    this.connect();
  }

  public subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  public unsubscribe(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(message: any): void {
    for (let observer of this.observers) {
      observer.update(message);
    }
  }

  private connect(): void {
    try {
      console.log("Conectando a Binace WebSocket");

      this.ws.on("open", () => {
        this.timer = setTimeout(() => {
          this.restart(this.ws);
        }, this.restartTime);
        console.log("Conexão estabelecida");
      });

      this.ws.on("message", (data: any) => {
        // console.log(JSON.parse(data));
        this.notifyObservers(JSON.stringify(JSON.parse(data)));
      });

      this.ws.on("close", () => {
        if (this.timer) {
          clearTimeout(this.timer);
          console.log("Conexão encerrada");
          this.connect();
        } else {
          console.log("Conexão não encerrada");
        }
      });
    } catch (error) {
      console.error(`Error starting WebSocket: ${error}`);
    }
  }

  private restart(ws: any) {
    try {
      ws.close();
    } catch (error) {
      console.error(`Error restarting WebSocket: ${error}`);
    }
  }
}

export default ClientBinance;