const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

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
    const ricette = await dbAll('SELECT nome, tipologia, ingredienti, alimentazione, immagine, preparazione  FROM ricettario');
    res.json(ricette);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users (create user with nickname and hashed password)
app.post('/api/users', async (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).json({ error: 'Nickname, email, and password are required.' });
  }

  try {
    // No hashing here, store password as-is
    const result = await dbRun(
      `INSERT INTO utenti (nickname, email, password) VALUES (?, ?, ?)`,
      [nickname, email, password]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});


// POST /api/login (login with password check)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const users = await dbAll('SELECT * FROM utenti WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare plain text passwords
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = user.id_user || user.id || user.rowid;

    res.status(200).json({ message: 'Login successful', userId: userId, nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});
app.post('/api/aggiungiRicetta', async (req, res) => {
  const { nome, tipologia, ingredienti, alimentazione, immagine, preparazione, author_id } = req.body;

  if (!nome || !tipologia || !ingredienti || !alimentazione || !preparazione || !author_id) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await dbRun(
      `INSERT INTO ricettario (nome, tipologia, ingredienti, alimentazione, immagine, preparazione, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, tipologia, ingredienti, alimentazione, immagine || null, preparazione, author_id]
    );

    res.status(201).json({ message: 'Recipe created successfully', recipeId: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recipe', details: err.message });
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
