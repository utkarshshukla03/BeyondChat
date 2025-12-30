import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'articles.db');

let db = null;

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('✓ Connected to SQLite database');
      }
    });
  }
  return db;
}

export function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.serialize(() => {
      // Create articles table
      database.run(`
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          author TEXT,
          content TEXT,
          excerpt TEXT,
          image_url TEXT,
          type TEXT DEFAULT 'original',
          related_article_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          published_date TEXT,
          FOREIGN KEY (related_article_id) REFERENCES articles(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating articles table:', err);
          reject(err);
        } else {
          console.log('✓ Articles table ready');
          resolve();
        }
      });
    });
  });
}

export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
