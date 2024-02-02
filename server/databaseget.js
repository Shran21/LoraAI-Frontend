const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/logindatas.db');

db.all('SELECT * From sessions ', (err, rows) => {
  if (err) {
    throw err;
  }

  console.log(rows);
});

db.close();
