import { createChart, CrosshairMode } from "lightweight-charts";

const chartOptions = {
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
};

const chart = createChart(
  document.getElementById("app"),
  chartOptions
);

const candlestickSeries = chart.addCandlestickSeries({
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderVisible: false,
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
});

let data = require("./data.json");

data = data["data"];

data = data.map((item) => ({
  time: Math.floor(new Date(item.date).getTime() / 1000),
  open: parseFloat(item.open),
  high: parseFloat(item.high),
  low: parseFloat(item.low),
  close: parseFloat(item.close),
  volume: parseInt(item.volume),
}));


candlestickSeries.setData(data);


chart.timeScale().fitContent();

let news_candles = [
  {
    time: data[data.length - 1].time + 60,
    open: 0.5055,
    high: 0.5056,
    low: 0.5050,
    close: 0.5054,
    volume: 79210,
  },
  {
    time: data[data.length - 1].time + 120,
    open: 0.5052,
    high: 0.5053,
    low: 0.5048,
    close: 0.5050,
    volume: 79211,
  },
  {
    time: data[data.length - 1].time + 180,
    open: 0.5051,
    high: 0.5052,
    low: 0.5047,
    close: 0.5049,
    volume: 79212,
  },
];

// adicionar mais três candles após 10 segundos
setTimeout(() => {
  news_candles.forEach((candle) => {
    candlestickSeries.update(candle);
  });
  console.log("adicionar mais três candles após 10 segundos");
}, 10000);


let last_candle = {
  time: news_candles[news_candles.length - 1].time,
  open: 0.5051,
  high: 0.5056,
  low: 0.5047,
  close: 0.5055,
  volume: 79212,
};

// atualizar último candle com novos dados após 5 segundos
setTimeout(() => {
  candlestickSeries.update(last_candle);
  console.log("atualizar último candle com novos dados após 5 segundos");
}, 15000);