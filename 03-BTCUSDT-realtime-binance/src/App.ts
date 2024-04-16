import express from "express";
import path from "path";
import WebSocket from "ws";
import ClientBinance from "./ClientBinance.js";

// CONECTA COMO CLIENTE NO WEBSOCKET DA BINANCE
const clientBinance = new ClientBinance();

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

// CRIA UM SERVIDOR WEB PARA SERVIR A APLICAÇÃO WEB
const app = express();
const publicPath = path.join(__dirname, "../webserver/public");
app.use(express.static(publicPath));

app.listen(8080, () => {
  console.log(`Web server is running at http://localhost:8080`);
});
