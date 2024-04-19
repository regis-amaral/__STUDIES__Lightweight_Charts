import ChartManager from "./ChartManager.js";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
const domElement = document.getElementById("lightweight-chart");

// INSTANCIA A CLASSE ChartManager
const chartManager = new ChartManager(domElement);

// Função para conectar SSE
function connectSSE() {
  let eventSource; // Variável para armazenar o EventSource

  eventSource = new EventSource("http://localhost:3001/init");

  chartManager.loadData([]);
  
  // criar um evento para quando receber uma mensagem
  eventSource.onmessage = function (event) {
    // converter a mensagem recebida para JSON
    const data = JSON.parse(event.data);

    // const jdata = {
    //   time: data.date - 3 * 60 * 60, // subtrai 3 horas para corresponder ao GMT-3
    //   open: parseFloat(data.open),
    //   high: parseFloat(data.high),
    //   low: parseFloat(data.low),
    //   close: parseFloat(data.close),
    //   volume: parseFloat(data.volume),
    // };

    // chamar o método updateData da classe ChartManager
    chartManager.updateData(data);
  };

  // criar um evento para quando ocorrer um erro
  eventSource.onerror = function (event) {
    console.error("Erro na conexão SSE:", event);
  };
}

// Iniciar a conexão SSE
connectSSE();
