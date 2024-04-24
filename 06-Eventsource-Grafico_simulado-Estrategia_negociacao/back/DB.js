const sqlite3 = require("sqlite3").verbose();

class DB {
  constructor() {
    this.db = new sqlite3.Database('./tradeList.db', (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the tradeList database.');
    });

    this.createTable();
  }

  createTable() {
    this.db.run(
      `CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY,
      date TEXT,
      trigger TEXT,
      percent REAL,
      time TEXT,
      price REAL,
      target REAL,
      status TEXT,
      btcUnits REAL,
      profit REAL,
      fee REAL,
      usdBalance REAL,
      btcBalance REAL,
      totalBalance REAL,
      opentrades INTEGER,
      sellDate TEXT
    )`,
      (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log("Table trades has been created or already exists.");
        }
      }
    );
  }

saveOrUpdate(trade) {
    let stmt = this.db.prepare(`INSERT OR REPLACE INTO trades (
        id, date, trigger, percent, time, price, target, status, btcUnits, profit, fee, usdBalance, btcBalance, totalBalance, opentrades, sellDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(
        trade.id,
        trade.date,
        trade.trigger,
        trade.percent,
        trade.time,
        trade.price,
        trade.target,
        trade.status,
        trade.btcUnits,
        trade.profit,
        trade.fee,
        trade.usdBalance,
        trade.btcBalance,
        trade.totalBalance,
        trade.opentrades,
        trade.sellDate
    );

    stmt.finalize();
}
}

module.exports = DB;