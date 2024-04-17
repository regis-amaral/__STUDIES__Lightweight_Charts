import { createChart, CrosshairMode, ISeriesApi } from "lightweight-charts";

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LineData {
  time: number;
  value: number;
}

class ChartManager {
  private domElement: HTMLElement;
  private chart: any;
  private candlestickSeries: any | null;
  private lineSeries: any | null;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.chart = null;
    this.candlestickSeries = null;
    this.lineSeries = null;
    this.initializeChart();
  }

  private initializeChart(): void {
    const chartProperties = {
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    };
    this.chart = createChart(this.domElement, chartProperties);

    this.chart.applyOptions({
      // width: 800,
      // height: 400,
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
        // rightOffset: 50,
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

  public async loadData(
    jsonData: (CandlestickData | LineData)[]
  ): Promise<void> {
    try {
      console.log("Loading data...");
      const data = jsonData.map((item) => ({
        time: item.time,
        open: (item as CandlestickData).open,
        high: (item as CandlestickData).high,
        low: (item as CandlestickData).low,
        close: (item as CandlestickData).close,
        volume: (item as CandlestickData).volume,
        value: (item as LineData).value,
      }));
      this.candlestickSeries.setData(data);
      this.lineSeries.setData(data);
      this.chart.timeScale().scrollToPosition(2, true);
      console.log("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }

  public async updateData(newData: any): Promise<void> {
    try {
      // console.log("Updating data...");
      if (Array.isArray(newData)) {
        newData.forEach((candle) => {
          this.candlestickSeries.update(candle);
        });
      } else {
        this.candlestickSeries.update(newData);
      }
      console.log(newData.time);
      // console.log("Data Updated successfully");
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }
}

export default ChartManager;
