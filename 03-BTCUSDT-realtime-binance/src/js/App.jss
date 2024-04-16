// const WebSocket = require('ws');

// const url = "wss://stream.binance.com:9443/ws/btcusdt@kline_1s";

// const restartTime = 60 * 60 * 10000; // 10 horas

// function start() {
//   try {
//     console.log("Conectando a Binace WebSocket");
//     const ws = new WebSocket(url);

//     ws.on("open", () => {
//       timer = setTimeout(() => {
//         restart(ws);
//       }, restartTime);
//       console.log("Conexão estabelecida");
//     });

//     ws.on("message", function incoming(data) {
//       // console.log(JSON.parse(data));
//     });

//     ws.on("close", () => {
//       clearTimeout(timer);
//       console.log("Conexão encerrada");
//       start();
//     });

//   } catch (error) {
//     console.error(`Error starting WebSocket: ${error}`);
//   }
// }

// function restart(ws) {
//   try {
//     ws.close();
//   } catch (error) {
//     console.error(`Error restarting WebSocket: ${error}`);
//   }
// }

// start();

