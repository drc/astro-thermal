import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dbDir: string = path.dirname(fileURLToPath(import.meta.url));
const dbFilePath: string = process.env.IMAGES_DB_PATH ?? path.resolve(dbDir, "images.db");

const db: DatabaseSync = new DatabaseSync(dbFilePath);

db.exec(
  "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)",
);

for (const column of ["user_agent TEXT", "ip_address TEXT", "file_name TEXT"]) {
  try {
    db.exec(`ALTER TABLE images ADD COLUMN ${column}`);
  } catch (err) {
    if (!(err instanceof Error && /duplicate column/i.test(err.message))) {
      console.error("Error adding column:", err);
    }
  }
}

export default db;
