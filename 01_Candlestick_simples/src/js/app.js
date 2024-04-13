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
