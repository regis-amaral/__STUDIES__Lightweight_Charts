const ChartManager = require("./ChartManager");

let startChartTimestamp;
if (process.argv[2] && process.argv[3] && process.argv[4]) {
  startChartTimestamp = new Date(process.argv[2]).getTime();
  maxOpenTrades = parseFloat(process.argv[3]);
  percenOfAmount = parseFloat(process.argv[4]);
} else {
  console.log(
    '\nInforme a data de início do gráfico, quantidade máxima de trades abertos e o percentual do saldo em dólar a utilizar em cada trade. \n\n'+
    'Exemplo para 1% do saldo em cada trade:\n\n'+
    'node Run.js "2023/01/09 12:53:00" 50 0.01\n'
  );
  return;
}

new ChartManager(null, startChartTimestamp, null,  maxOpenTrades, percenOfAmount);


/**
 * node Run.js "2023/01/09 12:53:00" 50 0.01
 */