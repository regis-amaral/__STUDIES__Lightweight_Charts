const sqlite3 = require("sqlite3").verbose();

class DB {
  constructor() {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear()}_${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;
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
