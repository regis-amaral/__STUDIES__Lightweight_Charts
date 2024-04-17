import ChartManager from "./ChartManager";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
const domElement = document.getElementById("lightweight-chart");

 // INSTANCIA A CLASSE ChartManager
const chartManager: any = new ChartManager(domElement!);

// Função para conectar WebSocket
function connectWebSocket() {
 

  let reconnectInterval: number = 1000; // Intervalo de tempo em milissegundos para tentar se reconectar
  let isConnected: boolean = false; // Variável para controlar se a conexão está estabelecida
  let ws: any; // Variável para armazenar a conexão WebSocket

  ws = new WebSocket("ws://localhost:8081");

  // criar um evento para quando a conexão for aberta
  ws.onopen = () => {
    console.log("Conexão aberta");
    chartManager.loadData([]);
    isConnected = true; // Define como verdadeiro quando a conexão é estabelecida
  };

  // criar um evento para quando a conexão for fechada
  ws.onclose = () => {
    console.log("Conexão fechada");
    isConnected = false; // Define como falso quando a conexão é fechada
    // Tenta reconectar após o intervalo de tempo especificado
    setTimeout(connectWebSocket, reconnectInterval);
  };

  // criar um evento para quando receber uma mensagem
  ws.onmessage = (event: any) => {
    // converter a mensagem recebida para JSON
    const data = JSON.parse(event.data);

    const jdata = {
      time: data.date - (3 * 60 * 60), // subtrai 3 horas para corresponder ao GMT-3
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      close: parseFloat(data.close),
      volume: parseFloat(data.volume),
    };

    // chamar o método updateData da classe ChartManager apenas se a conexão estiver estabelecida
    if (isConnected) {
      chartManager.updateData(jdata);
    }
  };
}

// Iniciar a conexão WebSocket
connectWebSocket();
