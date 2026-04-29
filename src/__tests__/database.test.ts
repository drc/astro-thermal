import { describe, it, expect, vi } from "vitest";
import type Database from "better-sqlite3";

type DB = Database.Database;

interface ColumnInfo {
	cid: number;
	name: string;
	type: string;
	notnull: number;
	dflt_value: string | null;
	pk: number;
}

interface ImageRow {
	id: number;
	data: Buffer;
	user_agent: string | null;
	ip_address: string | null;
	file_name: string | null;
}

async function importDbWithMemory(): Promise<DB> {
	vi.resetModules();
	process.env.IMAGES_DB_PATH = ":memory:";
	const mod = await import("@/lib/database");
	return mod.default as DB;
}

describe("database module", () => {
	it("initializes images table with expected columns", async () => {
		const db = await importDbWithMemory();
		const columns = db.prepare("PRAGMA table_info(images)").all() as ColumnInfo[];
		const columnNames = columns.map((c) => c.name);
		expect(columnNames).toEqual(
			expect.arrayContaining([
				"id",
				"data",
				"user_agent",
				"ip_address",
				"file_name",
			]),
		);
		db.close();
	});

	it("inserts and retrieves an image row", async () => {
		const db = await importDbWithMemory();
		const buf = Buffer.from("hello world");
		const res = db
			.prepare("INSERT INTO images (data, user_agent, ip_address, file_name) VALUES (?, ?, ?, ?)")
			.run(buf, "test-agent", "127.0.0.1", "foo.png");
		expect(res.lastInsertRowid).toBeDefined();
		const lastID = res.lastInsertRowid;
		if (typeof lastID !== "bigint" && typeof lastID !== "number")
			throw new Error("insert did not return lastID");
		const row = db
			.prepare("SELECT id, data, user_agent, ip_address, file_name FROM images WHERE id = ?")
			.get(lastID) as ImageRow | undefined;
		expect(row).toBeDefined();
		if (!row) throw new Error("expected row to be present");
		expect(row.id).toBe(Number(lastID));
		expect(row.data).toEqual(buf);
		expect(row.user_agent).toBe("test-agent");
		expect(row.ip_address).toBe("127.0.0.1");
		expect(row.file_name).toBe("foo.png");
		db.close();
	});
});
