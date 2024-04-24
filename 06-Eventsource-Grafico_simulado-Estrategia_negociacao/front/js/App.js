import ChartManager from "./ChartManager.js";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
const domElement = document.getElementById("lightweight-chart");

const domTradeList = document.getElementById("trade-list");

// INSTANCIA A CLASSE ChartManager
const chartManager = new ChartManager(domElement);

// Remove trades no sessionStorage
sessionStorage.removeItem("trades");

// Função para conectar SSE
function connectSSE() {
  let eventSource; // Variável para armazenar o EventSource

  eventSource = new EventSource("http://localhost:3001/init");
  
  // criar um evento para quando receber uma mensagem
  eventSource.onmessage = function (event) {
    // converter a mensagem recebida para JSON
    const data = JSON.parse(event.data);

    // chamar o método updateData da classe ChartManager
    chartManager.updateData(data);

    // Armazena trades no sessionStorage
    localStorage.setItem("trades", JSON.stringify(data.trades));
  };

  // criar um evento para quando ocorrer um erro
  eventSource.onerror = function (event) {
    console.error("Erro na conexão SSE:", event);
  };
}

// Iniciar a conexão SSE
connectSSE();
