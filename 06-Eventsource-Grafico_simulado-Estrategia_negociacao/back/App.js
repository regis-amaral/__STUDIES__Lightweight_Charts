const http = require("http");
const ChartManager = require("./ChartManager");

let clients = [];

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
  const client = {
    response: res,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Use a unique identifier for each client
  };
  clients.push(client);
  let chartManager = new ChartManager(client, startChartTimestamp, transmissionSpeed);
  console.log("Novo cliente conectado: " + clients.indexOf(client));
  res.on("close", () => {
    chartManager.stop();
    chartManager = null;
    console.log(`Cliente ${clients.indexOf(client)} desconectado`);
    // Remove the client from the list when it disconnects
    clients = clients.filter((c) => c !== client);
  });
}
