import { describe, it, expect, vi } from "vitest";
import type { Database } from "sqlite3";

type DB = Database;

interface RunResult {
	lastID?: number;
	changes?: number;
}

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

function runAsync(db: DB, sql: string, params?: unknown[]) {
	return new Promise<{ lastID?: number; changes?: number }>(
		(resolve, reject) => {
			db.run(sql, params ?? [], function (this: RunResult, err: Error | null) {
				if (err) return reject(err);
				resolve({ lastID: this?.lastID, changes: this?.changes });
			});
		},
	);
}

function getAsync<T>(db: DB, sql: string, params?: unknown[]) {
	return new Promise<T | undefined>((resolve, reject) => {
		db.get(sql, params ?? [], (err: Error | null, row?: T) => {
			if (err) return reject(err);
			resolve(row);
		});
	});
}

function allAsync<T>(db: DB, sql: string, params?: unknown[]) {
	return new Promise<T[]>((resolve, reject) => {
		db.all(sql, params ?? [], (err: Error | null, rows?: T[]) => {
			if (err) return reject(err);
			resolve(rows ?? []);
		});
	});
}

function closeAsync(db: DB) {
	return new Promise<void>((resolve, reject) => {
		db.close((err: Error | null) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

function waitForImagesTable(db: DB, timeout = 2000) {
	return new Promise<void>((resolve, reject) => {
		const start = Date.now();
		(function check() {
			db.get(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='images'",
				(err: Error | null, row?: { name: string }) => {
					if (err) return reject(err);
					if (row) return resolve();
					if (Date.now() - start > timeout)
						return reject(new Error("timed out waiting for images table"));
					setTimeout(check, 20);
				},
			);
		})();
	});
}

describe("database module", () => {
	it("initializes images table with expected columns", async () => {
		const db = await importDbWithMemory();
		await waitForImagesTable(db);
		const columns = await allAsync<ColumnInfo>(db, "PRAGMA table_info(images)");
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
		await closeAsync(db);
	});

	it("inserts and retrieves an image row", async () => {
		const db = await importDbWithMemory();
		await waitForImagesTable(db);
		const buf = Buffer.from("hello world");
		const res = await runAsync(
			db,
			"INSERT INTO images (data, user_agent, ip_address, file_name) VALUES (?, ?, ?, ?)",
			[buf, "test-agent", "127.0.0.1", "foo.png"],
		);
		expect(res.lastID).toBeDefined();
		const lastID = res.lastID;
		if (typeof lastID !== "number")
			throw new Error("insert did not return lastID");
		const row = await getAsync<ImageRow>(
			db,
			"SELECT id, data, user_agent, ip_address, file_name FROM images WHERE id = ?",
			[lastID],
		);
		expect(row).toBeDefined();
		if (!row) throw new Error("expected row to be present");
		expect(row.id).toBe(lastID);
		expect(row.data).toEqual(buf);
		expect(row.user_agent).toBe("test-agent");
		expect(row.ip_address).toBe("127.0.0.1");
		expect(row.file_name).toBe("foo.png");
		await closeAsync(db);
	});
});
