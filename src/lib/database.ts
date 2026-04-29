import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dbDir: string = path.dirname(fileURLToPath(import.meta.url));
const dbFilePath: string =
	process.env.IMAGES_DB_PATH ?? path.resolve(dbDir, "images.db");

const db: Database.Database = new Database(dbFilePath);

function addColumnIfMissing(sql: string): void {
	try {
		db.exec(sql);
	} catch (err) {
		if (err instanceof Error) {
			if (!/duplicate column/i.test(err.message)) {
				console.error("Error adding column:", err);
			}
		} else {
			console.error("Error adding column:", err);
		}
	}
}

db.exec(
	"CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)",
);

addColumnIfMissing("ALTER TABLE images ADD COLUMN user_agent TEXT");
addColumnIfMissing("ALTER TABLE images ADD COLUMN ip_address TEXT");
addColumnIfMissing("ALTER TABLE images ADD COLUMN file_name TEXT");

export default db;
