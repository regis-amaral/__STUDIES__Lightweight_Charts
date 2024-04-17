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

  private endpoints = [
    "wss://stream.binance.com:9443",
    "wss://stream.binance.com:443",
    "wss://data-stream.binance.vision"
  ];

  constructor() {
    this.observers = [];
    // this.url = "wss://stream.binance.com:9443/ws/btcusdt@kline_1s";
    this.url = `${this.endpoints[0]}/ws/btcusdt@kline_1s`;
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
        this.notifyObservers(this.configDataToSend(data));
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

  private configDataToSend(dataToSend: any) {
    dataToSend = JSON.parse(dataToSend);
    let data = {
      date: dataToSend["E"], // Kline Close time
      open: dataToSend["k"]["o"], // Open price
      high: dataToSend["k"]["h"], // High price
      low: dataToSend["k"]["l"], // Low price
      close: dataToSend["k"]["c"], // Close price
      volume: dataToSend["k"]["v"], // Volume
    };
    console.log(data);
    return JSON.stringify(data);
  }
}

export default ClientBinance;

// {
//   "e": "kline",     // Event type
//   "E": 1672515782136,   // Event time
//   "s": "BNBBTC",    // Symbol
//   "k": {
//     "t": 123400000, // Kline start time
//     "T": 123460000, // Kline close time
//     "s": "BNBBTC",  // Symbol
//     "i": "1m",      // Interval
//     "f": 100,       // First trade ID
//     "L": 200,       // Last trade ID
//     "o": "0.0010",  // Open price
//     "c": "0.0020",  // Close price
//     "h": "0.0025",  // High price
//     "l": "0.0015",  // Low price
//     "v": "1000",    // Base asset volume
//     "n": 100,       // Number of trades
//     "x": false,     // Is this kline closed?
//     "q": "1.0000",  // Quote asset volume
//     "V": "500",     // Taker buy base asset volume
//     "Q": "0.500",   // Taker buy quote asset volume
//     "B": "123456"   // Ignore
//   }
// }