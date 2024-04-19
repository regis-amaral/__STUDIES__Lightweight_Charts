class ChartManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.chart = null;
    this.candlestickSeries = null;
    this.lineSeries = null;
    this.lowPrice = null;
    this.circle = null;
    this.initializeChart();
    this.ema_series = null;
  }

  initializeChart() {
    const chartProperties = {
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      pane: 0,
    };
    this.chart = LightweightCharts.createChart(
      this.domElement,
      chartProperties
    );

    this.chart.applyOptions({
      title: "Graph",
      localization: {
        dateFormat: "dd-MM-yyyy",
        locale: "pt-BR",
      },
      priceScale: {
        position: "right",
        mode: 1,
        autoScale: true,
        invertScale: false,
        alignLabels: true,
        borderVisible: true,
        borderColor: "#24273E",
        scaleMargins: {
          top: 0.3,
          bottom: 0.3,
        },
      },
      timeScale: {
        barSpacing: 10,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        borderColor: "#fff000",
        visible: true,
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        vertLine: {
          color: "#6A5ACD",
          width: 1,
          style: 1,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: "#6A5ACD",
          width: 0.5,
          style: 1,
          visible: true,
          labelVisible: true,
        },
        mode: 0,
      },
      watermark: {
        color: "green",
        visible: true,
        text: "Regis Amaral",
        fontSize: 12,
        horzAlign: "left",
        vertAlign: "bottom",
      },
    });

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    this.lineSeries = this.chart.addLineSeries();
  }

  async loadData(jsonData) {
    try {
      console.log("Loading data...");
      const data = jsonData.map((item) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        value: item.value,
      }));
      this.candlestickSeries.setData(data);
      this.lineSeries.setData(data);
      this.chart.timeScale().scrollToPosition(2, true);

      // MEDIAS EXPONENCIAIS
      this.ema1_series = this.chart.addLineSeries({
        color: "green",
        lineWidth: 1,
      });
      const ema1_data = jsonData
        .filter((d) => d.ema1)
        .map((d) => ({ time: d.time, value: d.ema1 }));
      this.ema1_series.setData(ema1_data);

      this.ema2_series = this.chart.addLineSeries({
        color: "red",
        lineWidth: 1,
      });
      const ema2_data = jsonData
        .filter((d) => d.ema2)
        .map((d) => ({ time: d.time, value: d.ema2 }));
      this.ema2_series.setData(ema2_data);

      this.ema3_series = this.chart.addLineSeries({
        color: "orange",
        lineWidth: 1,
      });
      const ema3_data = jsonData
        .filter((d) => d.ema3)
        .map((d) => ({ time: d.time, value: d.ema3 }));
      this.ema3_series.setData(ema3_data);
      // FIM MEDIAS EXPONENCIAIS

      console.log("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }

  updateEma(candle) {
    if ("ema1" in candle) {
      this.ema1_series.update({ time: candle.time, value: candle.ema1 });
    }
    if ("ema2" in candle) {
      this.ema2_series.update({ time: candle.time, value: candle.ema2 });
    }
    if ("ema3" in candle) {
      this.ema3_series.update({ time: candle.time, value: candle.ema3 });
    }
  }

  async updateData(newData) {
    try {
      if (Array.isArray(newData)) {
        newData.forEach((candle) => {
          this.updateEma(candle);
          this.candlestickSeries.update(candle);
        });
      } else {
        this.updateEma(newData);
        this.candlestickSeries.update(newData);
      }

      // this.lowPrice = !this.lowPrice ? newData.low : this.lowPrice;

      // if (this.lowPrice && newData.low < this.lowPrice) {
      //   this.lowPrice = newData.low;
      //   if (this.circle) {
      //     this.chart.removeDrawing(this.circle);
      //   }
      //   this.circle = this.chart.addCircleAtPosition({
      //     time: newData.time,
      //     price: newData.low,
      //     color: "green",
      //     radius: 5,
      //   });
      // }
    } catch (error) {
      console.log(newData);
      console.error("Error fetching or parsing data:", error);
    }
  }
}

// module.exports = ChartManager;

export default ChartManager;