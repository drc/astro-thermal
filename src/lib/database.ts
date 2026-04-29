import sqlite3 from "sqlite3";
import type { Database } from "sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dbDir: string = path.dirname(fileURLToPath(import.meta.url));
const dbFilePath: string =
	process.env.IMAGES_DB_PATH ?? path.resolve(dbDir, "images.db");
const flags: number = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

const db: Database = new sqlite3.Database(dbFilePath, flags);

function addColumnIfMissing(sql: string): void {
	db.run(sql, (err: Error | null) => {
		if (!err) return;
		if (err instanceof Error) {
			if (!/duplicate column/i.test(err.message)) {
				console.error("Error adding column:", err);
			}
		} else {
			console.error("Error adding column:", err);
		}
	});
}

db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)",
	);

	addColumnIfMissing("ALTER TABLE images ADD COLUMN user_agent TEXT");
	addColumnIfMissing("ALTER TABLE images ADD COLUMN ip_address TEXT");
	addColumnIfMissing("ALTER TABLE images ADD COLUMN file_name TEXT");
});

export default db;
