import sqlite3 from "sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Use environment variable if set, otherwise resolve to absolute path in the same directory as this file
const dbDir = path.dirname(fileURLToPath(import.meta.url));
const dbFilePath = process.env.IMAGES_DB_PATH
	? process.env.IMAGES_DB_PATH
	: path.resolve(dbDir, "images.db");

const db = new sqlite3.Database(
	dbFilePath,
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
);
db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)",
	);
});

export default db;
