import axios from "axios";

interface Observer {
  update: (data: any) => void;
}

interface CandlestickData {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: number;
}

class ClientBinanceSimulado {
  private observers: Observer[];

  private symbol: string = "BTCUSDT";
  private interval: string = "1s";
  private startChartTimestamp: number;
  private transmissionSpeed: number;
  private apiUrl: string;
  private quantity: number = 1000;

  private currentIndex: number;
  private data: any[] | null;
  private timer: NodeJS.Timeout | null;

  private lastCandle: CandlestickData | null = null;

  constructor(startChartTimestamp: number, transmissionSpeed: number) {
    this.observers = [];
    this.startChartTimestamp = startChartTimestamp;
    this.transmissionSpeed = transmissionSpeed;
    this.currentIndex = 0;
    this.data = null;
    this.apiUrl = this.getApiUrl(startChartTimestamp);
    this.timer = null;
    this.startFetchingData();
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

  private getApiUrl(startChartTimestamp: number): string {
    this.apiUrl =
      `https://api.binance.com/api/v3/klines?` +
      `symbol=${this.symbol}&` +
      `interval=${this.interval}&` +
      `startTime=${startChartTimestamp}&` +
      `limit=${this.quantity}`;
    return this.apiUrl;
  }

  private async fetchChartData(): Promise<void> {
    try {
      const response = await axios.get(this.apiUrl);
      this.data = this.data ? [...this.data, ...response.data] : response.data;
    } catch (error) {
      console.error(`Error fetching chart data: ${error}`);
    }
  }

  private async startFetchingData(): Promise<void> {
    await this.fetchChartData();
    if (!this.data) return;

    const sendData = async () => {
      // atualiza um pouco antes de alcançar o fim da lista sem parar a execução do código
      if (this.currentIndex == (this.data!.length - 500)) {
        const initialStartTime = Date.now();
        // Enviar novo request com startTime incrementado
        this.startChartTimestamp += this.quantity * 1000;
        this.apiUrl = this.getApiUrl(this.startChartTimestamp);
        this.fetchChartData().then(() => {
          if (!this.data) return;
          const finalStartTime = Date.now();
          console.log(
            `Tempo de espera: ${finalStartTime - initialStartTime}ms`
          );
        });
      }
      const dataToSend = this.data![this.currentIndex];
      this.notifyObservers(this.configDataToSend(dataToSend));
      this.currentIndex++;
      this.timer = setTimeout(sendData, this.transmissionSpeed);
    };

    // this.timer = setTimeout(sendData, this.transmissionSpeed);
    sendData();
  }

  private configDataToSend(dataToSend: string) {
    // Constrói tempo com segundos zerados para candle de 1 minuto
    let date = new Date(dataToSend[6]);
    date.setSeconds(0);
    let time = Math.floor(date.getTime() / 1000);
    
    let data = null;

    if(!this.lastCandle){
      this.lastCandle = {} as CandlestickData;
    }

    if (this.lastCandle.time == time){
      // atualiza candle atual
      this.lastCandle.open = this.lastCandle.open; // Open price
      this.lastCandle.high = dataToSend[2] > this.lastCandle.high ? dataToSend[2] : this.lastCandle.high, // High price
      this.lastCandle.low = dataToSend[3] < this.lastCandle.low ? dataToSend[3] : this.lastCandle.low, // Low price
      this.lastCandle.close = dataToSend[4], // Close price
      this.lastCandle.volume += parseFloat(dataToSend[5]);  // Volume
    }else{
      console.log("Novo candle", time);
      this.lastCandle.time = time;
      this.lastCandle.open = dataToSend[1];
      this.lastCandle.high = dataToSend[2];
      this.lastCandle.low = dataToSend[3];
      this.lastCandle.close = dataToSend[4];
      this.lastCandle.volume = parseFloat(dataToSend[5]);
    }
    
    data = {
      date: this.lastCandle.time,
      open: this.lastCandle.open,
      high: this.lastCandle.high,
      low: this.lastCandle.low,
      close: this.lastCandle.close,
      volume: this.lastCandle.volume,
    };
    
    console.log(data);
    return JSON.stringify(data);
  }
  
}

export default ClientBinanceSimulado;

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