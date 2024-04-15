import ChartManager from "./ChartManager.js";

// REFERENCIA O ELEMENTO HTML ONDE O GRÁFICO SERÁ RENDERIZADO
let domElement = document.getElementById("lightweight-chart");

// INSTANCIA A CLASSE ChartManager
const chartManager = new ChartManager(domElement);

// CONJUNTO INICIAL DE DADOS
let data = require("./data.json");
data = data["data"];

// CARREGA OS DADOS INICIAIS
chartManager.loadData(data);

// NOVOS CANDLES
let news_candles = [
    {
        time: Math.floor(new Date(data[data.length - 1].date).getTime() / 1000) + 60,
        open: 0.5055,
        high: 0.5056,
        low: 0.505,
        close: 0.5054,
        volume: 79210,
    },
    {
        time: Math.floor(new Date(data[data.length - 1].date).getTime() / 1000) + 120,
        open: 0.5052,
        high: 0.5053,
        low: 0.5048,
        close: 0.505,
        volume: 79211,
    },
    {
        time: Math.floor(new Date(data[data.length - 1].date).getTime() / 1000) + 180,
        open: 0.5051,
        high: 0.5052,
        low: 0.5047,
        close: 0.5049,
        volume: 79212,
    },
];

// AGUARDA 5 SEGUNDOS PARA ADICIONAR MAIS TRÊS CANDLES
setTimeout(() => {
    chartManager.updateData(news_candles);
    console.log("adicionou mais três candles após 5 segundos");
}, 5000);


// ATUALIZA DADOS DO ÚLTIMO CANDLE APÓS 10 SEGUNDOS
 let last_candle = {
    time: news_candles[news_candles.length - 1].time,
    open: 0.5051,
    high: 0.5056,
    low: 0.5047,
    close: 0.5055,
    volume: 79212,
};
setTimeout(() => {
    chartManager.updateData(last_candle);
    console.log("atualizou último candle com novos dados após 10 segundos");
}, 10000);
