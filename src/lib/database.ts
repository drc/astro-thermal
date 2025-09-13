import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./images.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)",
	);
});

export default db;
