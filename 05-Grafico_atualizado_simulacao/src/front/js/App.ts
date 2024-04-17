import ChartManager from "./ChartManager";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
const domElement = document.getElementById("lightweight-chart");

// INSTANCIA A CLASSE ChartManager
const chartManager = new ChartManager(domElement!);
chartManager.loadData([]);

// criar uma conexão websocket para se conectar em ws://localhost:8081
const ws = new WebSocket("ws://localhost:8081");

// criar um evento para quando a conexão for aberta
ws.onopen = () => {
  console.log("Conexão aberta");
};
// criar um evento para quando a conexão for fechada
ws.onclose = () => {
  console.log("Conexão fechada");
};
// criar um evento para quando receber uma mensagem
ws.onmessage = (event) => {
  // converter a mensagem recebida para JSON
  const data = JSON.parse(event.data);

  const jdata = {
    time: Math.floor(new Date(data.date).getTime() / 1000),
    open: parseFloat(data.open),
    high: parseFloat(data.high),
    low: parseFloat(data.low),
    close: parseFloat(data.close),
    volume: parseFloat(data.volume),
  };

  // chamar o método updateData da classe ChartManager
  chartManager.updateData(jdata);

  // ws.close();
};
