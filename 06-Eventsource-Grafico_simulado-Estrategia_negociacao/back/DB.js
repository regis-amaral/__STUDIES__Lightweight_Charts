const sqlite3 = require("sqlite3").verbose();

class DB {
  constructor(startChartTimestamp) {
    const currentDate = new Date(startChartTimestamp);
    // Obtendo os componentes individuais da data
    const dia = currentDate.getDate().toString().padStart(2, '0'); // Dia com dois dígitos
    const mes = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mês com dois dígitos (lembrando que os meses começam de zero)
    const ano = currentDate.getFullYear().toString(); // Ano com quatro dígitos
    // Obtendo os componentes individuais da hora
    const hora = currentDate.getHours().toString().padStart(2, '0'); // Hora com dois dígitos
    const minuto = currentDate.getMinutes().toString().padStart(2, '0'); // Minuto com dois dígitos
    const segundo = currentDate.getSeconds().toString().padStart(2, '0'); // Segundo com dois dígitos
    // Montando a string formatada
    const formattedDate = `${dia}${mes}${ano}_${hora}${minuto}${segundo}`;
    //console.log(dataFormatada); // Saída: "DDMMAAA_HHMMSS"

    this.table_name = `trades`;
    this.db = new sqlite3.Database(`./databases/${formattedDate}.db`, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the tradeList database.");
    });

    this.createTable();
  }

  createTable() {
    this.db.serialize(() => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.table_name} (
        id INTEGER PRIMARY KEY,
        date DATETIME,
        trigger REAL,
        percent REAL,
        target REAL,
        status TEXT,
        profit REAL,
        fee REAL,
        usdBalance REAL,
        btcBalance REAL,
        totalBalance REAL,
        opentrades INTEGER,
        buy_time INTEGER,
        buy_price REAL,
        buy_units REAL,
        sell_time INTEGER,
        sell_price REAL,
        sell_units REAL
      )`,
        (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log("Table trades has been created or already exists.");
          }
        }
      );
    });
  }

  saveOrUpdate(trade) {
    this.db.serialize(() => {
      let stmt = this.db.prepare(`INSERT OR REPLACE INTO ${this.table_name} (
        id,
        date,
        trigger,
        percent,
        target,
        status,
        profit,
        fee,
        usdBalance,
        btcBalance,
        totalBalance,
        opentrades,
        buy_time,
        buy_price,
        buy_units,
        sell_time,
        sell_price,
        sell_units
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      stmt.run(
        trade.id,
        trade.date,
        trade.trigger,
        trade.percent,
        trade.target,
        trade.status,
        trade.profit,
        trade.fee,
        trade.usdBalance,
        trade.btcBalance,
        trade.totalBalance,
        trade.opentrades,
        trade.buy.time,
        trade.buy.price,
        trade.buy.units,
        trade.sell.time,
        trade.sell.price,
        trade.sell.units
      );

      stmt.finalize();
    });
  }

}

module.exports = DB;
