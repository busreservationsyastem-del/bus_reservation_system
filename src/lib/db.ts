import { createClient } from "@libsql/client";
import path from "path";

// SQLite database stored locally
const db = createClient({
  url: `file:${path.join(process.cwd(), "bus_reservation.db")}`,
});

// Initialize the bookings table
export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pnr TEXT UNIQUE NOT NULL,
      bus_name TEXT NOT NULL,
      from_location TEXT NOT NULL,
      to_location TEXT NOT NULL,
      journey_date TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      passenger_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      age INTEGER NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export default db;
