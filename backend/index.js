const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;


app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// Ensure the data directory exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'myRefrechefDatabase');

let db;
try {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      db.run('PRAGMA foreign_keys = ON;');
    }
  });
} catch (e) {
  console.error('Failed to initialize database:', e.message);
}

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};



// GET endpoint to fetch all recipes from ricettario
app.get('/ricette', (req, res) => {
  const query = 'SELECT * FROM ricettario';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Keep the server running even if the database connection fails
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Closed the database connection.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Dummy interval to keep the process alive for debugging
setInterval(() => {}, 1000);
