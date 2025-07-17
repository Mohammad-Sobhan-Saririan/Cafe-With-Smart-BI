import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { nanoid } from 'nanoid'; // We can still use this for IDs

// This is a top-level async function that we'll call to initialize the DB
async function setup() {
  const db = await open({
    filename: './cafe.sqlite',
    driver: sqlite3.Database
  });

  // Keep the products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      imageUrl TEXT,
      rating REAL DEFAULT 0,
      maxOrderPerUser INTEGER DEFAULT 5,
      description TEXT,
      stock INTEGER DEFAULT 100,
      isDisabled BOOLEAN DEFAULT 0
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS floors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT NOT NULL,
    totalAmount INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority INTEGER DEFAULT 1, -- ADD THIS LINE (e.g., 1=Normal, 2=High)
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deliveryFloorId INTEGER REFERENCES floors(id),
    FOREIGN KEY (userId) REFERENCES users (id)
  )
`);

  // the users table
  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    city TEXT,
    age INTEGER,
    position TEXT,
    creditLimit INTEGER DEFAULT 1000000,
    creditBalance INTEGER DEFAULT 1000000,
    role TEXT NOT NULL DEFAULT 'user',
    employeeNumber TEXT UNIQUE,
    defaultFloorId INTEGER REFERENCES floors(id)
  )
`);

  // 2. Modify the orders table
  await db.exec(`
  CREATE TABLE IF NOT EXISTS configs (
    feature TEXT PRIMARY KEY,
    isEnabled BOOLEAN NOT NULL
  )
`);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    name TEXT NOT NULL,
    nl_query TEXT,
    sql_query TEXT NOT NULL,
    viz_type TEXT DEFAULT 'table',
    -- ADD THE FOLLOWING TWO COLUMNS --
    chart_config TEXT, -- Will store the chart settings as a JSON string
    conversation_history TEXT, -- Will store the chat history as a JSON string
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES users (id)
  )
`);


  await db.run(
    `INSERT OR IGNORE INTO floors (id, name) VALUES (?, ?)`,
    ['1', 'نیم طبقه']
  );

  await db.run(
    `INSERT OR IGNORE INTO configs (feature, isEnabled) VALUES (?, ?)`,
    ['creditSystem', 0] // 0 for false
  );

  return { db, nanoid };
}

// Call the setup function and export the promise it returns
const dbPromise = setup();

export { dbPromise };