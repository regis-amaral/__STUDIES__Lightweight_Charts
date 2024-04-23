class ChartManager {

  constructor(domElement) {
    this.domElement = domElement;

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

    this.candlestickSeries = this.chart.addCandlestickSeries();

    // Marcadores de preço monitorados
    this.topPrice = null;
    this.basePrice = null;
    this.topPriceLine = null;
    this.basePriceLine = null;


    // MEDIAS EXPONENCIAIS
    this.ema1_series = this.chart.addLineSeries({
      color: "green",
      lineWidth: 1,
    });
    this.ema2_series = this.chart.addLineSeries({
      color: "red",
      lineWidth: 1,
    });
    this.ema3_series = this.chart.addLineSeries({
      color: "orange",
      lineWidth: 1,
    });

    // MACD FAST
    this.macd_fast_series = this.chart.addLineSeries({
      color: "blue",
      lineWidth: 1,
      pane: 1,
    });
    //MACD SIGNAL
    this.macd_signal_series = this.chart.addLineSeries({
      color: "red",
      lineWidth: 1,
      pane: 1,
    });
    //MACD HISTOGRAM 
    this.macd_histogram_series = this.chart.addHistogramSeries({
      pane: 1,
    });

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

  updateMacd(candle) {
    if ("macd" in candle) {
      this.macd_fast_series.update({ time: candle.time, value: candle.macd });
    }
    if ("signal" in candle) {
      this.macd_signal_series.update({ time: candle.time, value: candle.signal });
    }
    if ("histogram" in candle) {
      this.macd_histogram_series.update({ time: candle.time, value: candle.histogram });
    }
  }

  async updateData(newData) {

    let chartData = newData.chart;
    
    let trades = newData.trades;

    // Plotar trades
    if (trades && trades.length > 0) {
      // console.log(trades);
    }

    try {
      if (Array.isArray(chartData)) {
        
        // console.log(JSON.stringify(chartData, null, 2));

        this.candlestickSeries.setData(chartData);

        const ema1_data = chartData
          .filter((d) => d.ema1)
          .map((d) => ({ time: d.time, value: d.ema1 }));
        this.ema1_series.setData(ema1_data);

        const ema2_data = chartData
          .filter((d) => d.ema2)
          .map((d) => ({ time: d.time, value: d.ema2 }));
        this.ema2_series.setData(ema2_data);

        const ema3_data = chartData
          .filter((d) => d.ema3)
          .map((d) => ({ time: d.time, value: d.ema3 }));
        this.ema3_series.setData(ema3_data);
          
        const macd_fast_data = chartData
          .filter((d) => d.macd)
          .map((d) => ({ time: d.time, value: d.macd }));
        this.macd_fast_series.setData(macd_fast_data);

        const macd_signal_data = chartData
          .filter((d) => d.signal)
          .map((d) => ({ time: d.time, value: d.signal }));
        this.macd_signal_series.setData(macd_signal_data);

        const macd_histogram_data = chartData
          .filter((d) => d.histogram)
          .map((d) => ({ time: d.time, value: d.histogram }));
        this.macd_histogram_series.setData(macd_histogram_data);
        
      } else {
        this.updateEma(chartData);
        this.candlestickSeries.update(chartData);
        this.updateMacd(chartData);

        if (chartData.line_top != this.topPrice) {
          try {
            this.candlestickSeries.removePriceLine(this.topPriceLine);
          } catch (error) {}
          this.topPrice = chartData.line_top;
          this.topPriceLine = this.candlestickSeries.createPriceLine({
            price: this.topPrice,
            color: "green",
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dotted,
            axisLabelVisible: true,
            title: "Top Price",
          });
        }

        if (chartData.line_base != this.basePrice) {
          try {
            this.candlestickSeries.removePriceLine(this.basePriceLine);
          } catch (error) {}
          this.basePrice = chartData.line_base;
          this.basePriceLine = this.candlestickSeries.createPriceLine({
            price: this.basePrice,
            color: "red",
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dotted,
            axisLabelVisible: true,
            title: "Base Price",
          });
        }
      }

       this.chart.timeScale().scrollToPosition(2, true);

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