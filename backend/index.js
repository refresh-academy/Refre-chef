const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const dbPath = path.resolve(__dirname, 'data/myRefrechefDatabase');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON;');
  }
});

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

// GET /api/ricette
app.get('/api/ricette', async (req, res) => {
  try {
    const ricette = await dbAll('SELECT * FROM ricette');
    res.json(ricette);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  const { nickname, email, password } = req.body;

  // Basic validation
  if (!nickname || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const result = await dbRun(
      `INSERT INTO utenti (nickname, email, password) VALUES (?, ?, ?)`,
      [nickname, email, password]
    );
    res.status(201).json({ message: 'User created successfully', userId: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Closed the database connection.');
    }
    process.exit(0);
  });
});
