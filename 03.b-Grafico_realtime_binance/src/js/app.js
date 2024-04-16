import ChartManager from "./ChartManager.js";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
let domElement = document.getElementById("lightweight-chart");

// INSTANCIA A CLASSE ChartManager
const chartManager = new ChartManager(domElement);
chartManager.loadData([]);

// criar uma conexão websocket para se conectar em ws://localhost:8081
const ws = new WebSocket("ws://localhost:8081");

// criar um evento para quando a conexão for aberta
ws.onopen = () => {
    console.log("Conexão aberta");
};
//criar um evento para quando a conexão for fechada
ws.onclose = () => {
    console.log("Conexão fechada");
};
// criar um evento para quando receber uma mensagem
ws.onmessage = (event) => {
  // converter a mensagem recebida para JSON
  const data = JSON.parse(event.data);

  let jdata = {
    time: data["k"]["T"],
    open: parseFloat(data["k"]["o"]),
    high: parseFloat(data["k"]["h"]),
    low: parseFloat(data["k"]["l"]),
    close: parseFloat(data["k"]["c"]),
    volume: parseFloat(data["k"]["v"]),
  };

  // console.log(jdata);

  let last_candle = {
    time: 1713231919999,
    open: 0.5051,
    high: 0.5056,
    low: 0.5047,
    close: 0.5055,
    volume: 79212,
  };

  // console.log(last_candle);
  
  // chamar o método updateData da classe ChartManager
  chartManager.updateData(jdata);

  // ws.close();
};
