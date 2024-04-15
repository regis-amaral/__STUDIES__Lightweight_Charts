//importe o LightweightCharts
import { createChart, CrosshairMode } from "lightweight-charts";

class ChartManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.chart = null;
    this.candlestickSeries = null;
    this.lineSeries = null;
    this.initializeChart();
  }

  /**
   * Inicializa o gráfico criando uma nova instância de LightweightCharts,
   * configurando as propriedades do gráfico e adicionando as séries de candlestick
   */
  initializeChart() {
    const chartProperties = {
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    };
    this.chart = createChart(
        this.domElement, 
        chartProperties
    );

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    this.lineSeries = this.chart.addLineSeries();
  }

  /**
   * Carrega os dados de um arquivo JSON e os define para a série de candlestick.
   * @async
   * @returns {Promise<void>} Uma promise que é resolvida quando os dados são carregados e definidos.
   */
  async loadData(jsonData) {
    try {
      console.log("Loading data...");
      let data = jsonData.map((item) => ({
        time: Math.floor(new Date(item.date).getTime() / 1000),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
      }));
      this.candlestickSeries.setData(data);
      this.chart.timeScale().scrollToPosition(data.length - 5, true);
      console.log("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }

  /**
   * Atualiza os dados da série de candlestick.
   * @param {Array | item json} newData - Os novos dados para atualizar a série.
   * @returns {Promise<void>} - Uma promise que é resolvida quando os dados são atualizados.
   */
  async updateData(newData) {
    try {
      console.log("Updating data...");
      if (Array.isArray(newData)) {
        newData.forEach((candle) => {
          this.candlestickSeries.update(candle);
        });
      } else {
        this.candlestickSeries.update(newData);
      }
      console.log("Data Updated successfully");
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }
}
export default ChartManager;
