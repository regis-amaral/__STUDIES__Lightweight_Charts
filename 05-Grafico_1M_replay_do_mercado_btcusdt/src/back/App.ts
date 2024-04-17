import express from "express";
import path from "path";
import WebSocket from "ws";
// import ClientBinance from "./ClientBinance.js";
import ClientBinanceSimulado from "./ClientBinanceSimulado.js";

// CONECTA COMO CLIENTE NO WEBSOCKET DA BINANCE
// const clientBinance = new ClientBinance();
const clientBinance = new ClientBinanceSimulado(new Date("2024/04/17 12:34:00").getTime(), 50);

// CRIA UM WEBSOCKET SERVER PARA NOTIFICAR OS CLIENTES WEB
const wss = new WebSocket.Server({ port: 8081 });
wss.on("connection", (ws) => {
  const client = {
    update: (data: any) => {
      ws.send(data);
    },
  };
  clientBinance.subscribe(client);

  ws.on("close", () => {
    clientBinance.unsubscribe(client);
  });
});

// CRIA UM SERVIDOR WEB PARA O GRÁFICO EM TEMPO REAL
const app = express();
app.use(express.static(path.join(__dirname, "../front")));
app.listen(8080);
