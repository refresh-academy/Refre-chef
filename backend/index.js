const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const JWT_SECRET = 'your_secret_key_here'; // Replace with env var in production

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
    // Create groceryList table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS groceryList (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ingredient TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      UNIQUE(user_id, ingredient)
    )`);
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

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// GET /api/ricette
app.get('/api/ricette', async (req, res) => {
  try {
    const { tipologia } = req.query;
    let query = `
      SELECT r.id, r.nome, r.descrizione, r.tipologia, r.alimentazione, r.immagine, r.preparazione, r.preparazione_dettagliata, r.origine, r.porzioni, r.allergeni, r.tempo_preparazione, r.kcal, r.author_id, u.nickname as author
      FROM ricettario r
      LEFT JOIN utenti u ON r.author_id = u.id_user
    `;
    let params = [];
    if (tipologia) {
      query += ' WHERE r.tipologia = ?';
      params.push(tipologia);
    }
    const ricette = await dbAll(query, params);
    res.json(ricette);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/salvaRicetta', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { id_ricetta } = req.body;
  if (!id_ricetta) {
    return res.status(400).json({ error: 'id_ricetta is required.' });
  }
  try {
    const existing = await dbAll(
      `SELECT * FROM ricetteSalvate WHERE id_user = ? AND id_ricetta = ?`,
      [userId, id_ricetta]
    );
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Recipe already saved by this user.' });
    }
    const result = await dbRun(
      `INSERT INTO ricetteSalvate (id_user, id_ricetta) VALUES (?, ?)`,
      [userId, id_ricetta]
    );
    res.status(201).json({ message: 'Recipe saved successfully', saveId: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe', details: err.message });
  }
});

// POST /api/users (create user with nickname and hashed password)
app.post('/api/users', async (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).json({ error: 'Nickname, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO utenti (nickname, email, password) VALUES (?, ?, ?)`,
      [nickname, email, hashedPassword]
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

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = user.id_user || user.id || user.rowid;
    const token = jwt.sign({ userId, nickname: user.nickname }, JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ message: 'Login successful', userId: userId, nickname: user.nickname, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// POST /api/aggiungiRicetta (protected)
app.post('/api/aggiungiRicetta', authenticateToken, async (req, res) => {
  const { nome, descrizione, tipologia, alimentazione, immagine, preparazione, preparazione_dettagliata, origine, porzioni, allergeni, tempo_preparazione, kcal, ingredienti_grammi } = req.body;
  const author_id = req.user.userId;

  if (!nome || !descrizione || !tipologia || !alimentazione || !immagine || !preparazione || !preparazione_dettagliata || !origine || !porzioni || !allergeni || !tempo_preparazione || !kcal) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!Array.isArray(ingredienti_grammi) || ingredienti_grammi.length === 0 || ingredienti_grammi.some(ing => !ing.nome || !ing.grammi)) {
    return res.status(400).json({ error: 'Ingredienti e grammi obbligatori.' });
  }

  try {
    // Insert recipe
    const result = await dbRun(
      `INSERT INTO ricettario (nome, descrizione, tipologia, alimentazione, immagine, preparazione, preparazione_dettagliata, origine, porzioni, allergeni, kcal, tempo_preparazione, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descrizione, tipologia, alimentazione, immagine, preparazione, preparazione_dettagliata, origine, porzioni, allergeni, kcal, tempo_preparazione, author_id]
    );
    const ricettaId = result.id;

    // Insert ingredient grams
    for (const ing of ingredienti_grammi) {
      await dbRun(
        `INSERT INTO ingredienti_grammi (ricetta_id, ingrediente, grammi) VALUES (?, ?, ?)`,
        [ricettaId, ing.nome, ing.grammi]
      );
    }

    res.status(201).json({ message: 'Recipe created successfully', recipeId: ricettaId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recipe', details: err.message });
  }
});

// GET /api/ricetteSalvate (protected, uses user from token)
app.get('/api/ricetteSalvate', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const savedRecipes = await dbAll(
      `SELECT r.id, r.nome, r.alimentazione, r.immagine, r.descrizione, r.kcal, r.tempo_preparazione, r.porzioni
       FROM ricettario r
       INNER JOIN ricetteSalvate s ON r.id = s.id_ricetta
       WHERE s.id_user = ?`,
      [userId]
    );
    res.status(200).json(savedRecipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve saved recipes', details: err.message });
  }
});

// DELETE /api/salvaRicetta (protected)
app.delete('/api/salvaRicetta', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { id_ricetta } = req.body;
  if (!id_ricetta) {
    return res.status(400).json({ error: 'id_ricetta is required.' });
  }
  try {
    const result = await dbRun(
      `DELETE FROM ricetteSalvate WHERE id_user = ? AND id_ricetta = ?`,
      [userId, id_ricetta]
    );
    if (result.changes > 0) {
      res.status(200).json({ message: 'Recipe removed from saved.' });
    } else {
      res.status(404).json({ error: 'Recipe not found in saved.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved recipe', details: err.message });
  }
});

// Add ingredients of a recipe to the user's grocery list
app.post('/api/addToGroceryList', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { recipeId, porzioni } = req.body;
  if (!recipeId) {
    return res.status(400).json({ error: 'recipeId is required.' });
  }
  try {
    // Get ingredients and grams from the normalized table
    const ingredients = await dbAll('SELECT ingrediente, grammi FROM ingredienti_grammi WHERE ricetta_id = ?', [recipeId]);
    if (ingredients.length === 0) {
      return res.status(404).json({ error: 'Recipe or ingredients not found.' });
    }
    // Get original portions
    const ricetta = await dbAll('SELECT porzioni FROM ricettario WHERE id = ?', [recipeId]);
    const origPorzioni = ricetta[0]?.porzioni || 1;
    const multiplier = porzioni && porzioni > 0 ? porzioni / origPorzioni : 1;
    // For each ingredient, insert or update quantity (grams * multiplier)
    for (const ing of ingredients) {
      const qty = Math.round(ing.grammi * multiplier);
      await dbRun(
        `INSERT INTO groceryList (user_id, ingredient, quantity) VALUES (?, ?, ?)
         ON CONFLICT(user_id, ingredient) DO UPDATE SET quantity = quantity + ?`,
        [userId, ing.ingrediente, qty, qty]
      );
    }
    res.status(201).json({ message: 'Ingredients added to grocery list.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to grocery list', details: err.message });
  }
});

// Get the user's grocery list
app.get('/api/groceryList', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const items = await dbAll('SELECT ingredient, quantity FROM groceryList WHERE user_id = ?', [userId]);
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve grocery list', details: err.message });
  }
});

// Remove a single ingredient from the user's grocery list
app.delete('/api/groceryList/ingredient', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { ingredient } = req.body;
  if (!ingredient) {
    return res.status(400).json({ error: 'ingredient is required.' });
  }
  try {
    const result = await dbRun('DELETE FROM groceryList WHERE user_id = ? AND ingredient = ?', [userId, ingredient]);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Ingredient removed from grocery list.' });
    } else {
      res.status(404).json({ error: 'Ingredient not found in grocery list.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove ingredient', details: err.message });
  }
});

// Clear the user's grocery list
app.post('/api/groceryList/clear', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    await dbRun('DELETE FROM groceryList WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Grocery list cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear grocery list', details: err.message });
  }
});

// Edit the quantity of an ingredient in the user's grocery list
app.put('/api/groceryList/ingredient', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { ingredient, quantity } = req.body;
  if (!ingredient || typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'ingredient and valid quantity are required.' });
  }
  try {
    const result = await dbRun('UPDATE groceryList SET quantity = ? WHERE user_id = ? AND ingredient = ?', [quantity, userId, ingredient]);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Ingredient quantity updated.' });
    } else {
      res.status(404).json({ error: 'Ingredient not found in grocery list.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingredient quantity', details: err.message });
  }
});

// Endpoint to get ingredients with grams for a recipe
app.get('/api/ingredienti/:ricettaId', async (req, res) => {
  const ricettaId = req.params.ricettaId;
  try {
    const rows = await dbAll('SELECT ingrediente, grammi FROM ingredienti_grammi WHERE ricetta_id = ?', [ricettaId]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err.message });
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
