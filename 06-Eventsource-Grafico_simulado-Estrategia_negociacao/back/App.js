const http = require("http");
const ChartManager = require("./ChartManager");

let chartManager;

let startChartTimestamp = new Date("2024/04/17 12:34:00").getTime();

let transmissionSpeed = 1000;

http
  .createServer((req, res) => {
    dispachEvent(req.url, res);
  })
  .listen(3001, () => {
    console.log("Servidor rodando em http://localhost:3001");
  });

function setHeaders(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();
}

function dispachEvent(url, res) {
  setHeaders(res);
  switch (url) {
    case "/init":
      init(res);
      break;
  }
}

function init(res) {
  chartManager = new ChartManager(res, startChartTimestamp, transmissionSpeed);
  res.on("close", () => {
    chartManager.stop();
    console.log("Cliente desconectado");
  });
}
