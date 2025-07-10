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
      recipe_id INTEGER NOT NULL,
      UNIQUE(user_id, ingredient, recipe_id)
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
      SELECT r.id, r.nome, r.descrizione, r.tipologia, r.alimentazione, r.immagine, r.origine, r.porzioni, r.allergeni, r.tempo_preparazione, r.kcal, r.author_id, u.nickname as author
      FROM ricettario r
      LEFT JOIN utenti u ON r.author_id = u.id_user
    `;
    let params = [];
    if (tipologia) {
      query += ' WHERE r.tipologia = ?';
      params.push(tipologia);
    }
    const ricette = await dbAll(query, params);
    // For each recipe, fetch steps
    for (const r of ricette) {
      const steps = await dbAll('SELECT step_number, testo FROM steps WHERE ricetta_id = ? ORDER BY step_number ASC', [r.id]);
      r.steps = steps.map(s => s.testo);
    }
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
    if (err && err.message && err.message.includes('UNIQUE')) {
      if (err.message.includes('nickname')) {
        return res.status(409).json({ error: 'Nickname già in uso. Scegli un altro nickname.' });
      }
      if (err.message.includes('email')) {
        return res.status(409).json({ error: 'Email già in uso.' });
      }
    }
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

    const userId = user.id_user;
    const token = jwt.sign({ userId, nickname: user.nickname }, JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ message: 'Login successful', userId: userId, nickname: user.nickname, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// POST /api/aggiungiRicetta (protected)
app.post('/api/aggiungiRicetta', authenticateToken, async (req, res) => {
  const { nome, descrizione, tipologia, alimentazione, immagine, origine, porzioni, allergeni, tempo_preparazione, kcal, ingredienti_grammi, steps } = req.body;
  const author_id = req.user.userId;

  if (!nome || !descrizione || !tipologia || !alimentazione || !immagine || !origine || !porzioni || !allergeni || !tempo_preparazione || !kcal) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!Array.isArray(ingredienti_grammi) || ingredienti_grammi.length === 0 || ingredienti_grammi.some(ing => !ing.nome || !ing.grammi)) {
    return res.status(400).json({ error: 'Ingredienti e grammi obbligatori.' });
  }

  try {
    // Insert recipe
    const result = await dbRun(
      `INSERT INTO ricettario (nome, descrizione, tipologia, alimentazione, immagine, origine, porzioni, allergeni, kcal, tempo_preparazione, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descrizione, tipologia, alimentazione, immagine, origine, porzioni, allergeni, kcal, tempo_preparazione, author_id]
    );
    const ricettaId = result.id;

    // Insert ingredient grams
    for (const ing of ingredienti_grammi) {
      await dbRun(
        `INSERT INTO ingredienti_grammi (ricetta_id, ingrediente, grammi, unita) VALUES (?, ?, ?, ?)`,
        [ricettaId, ing.nome, ing.grammi, ing.unita ? ing.unita : 'g']
      );
    }

    // Insert steps if present
    if (Array.isArray(steps) && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const testo = steps[i];
        await dbRun(
          `INSERT INTO steps (ricetta_id, step_number, testo) VALUES (?, ?, ?)`,
          [ricettaId, i + 1, testo]
        );
      }
    }

    res.status(201).json({ message: 'Recipe created successfully', recipeId: ricettaId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe', details: err.message });
  }
});

// PUT /api/ricette/:id (aggiorna ricetta esistente)
app.put('/api/ricette/:id', authenticateToken, async (req, res) => {
  const ricettaId = req.params.id;
  const userId = req.user.userId;
  const { nome, descrizione, tipologia, alimentazione, immagine, origine, porzioni, allergeni, tempo_preparazione, kcal, ingredienti_grammi, steps } = req.body;
  if (!nome || !descrizione || !tipologia || !alimentazione || !immagine || !origine || !porzioni || !allergeni || !tempo_preparazione || !kcal) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!Array.isArray(ingredienti_grammi) || ingredienti_grammi.length === 0 || ingredienti_grammi.some(ing => !ing.nome || !ing.grammi)) {
    return res.status(400).json({ error: 'Ingredienti e grammi obbligatori.' });
  }
  try {
    // Verifica che l'utente sia l'autore
    const rows = await dbAll('SELECT author_id FROM ricettario WHERE id = ?', [ricettaId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Ricetta non trovata.' });
    }
    if (String(rows[0].author_id) !== String(userId)) {
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questa ricetta.' });
    }
    // Aggiorna ricetta
    await dbRun(
      `UPDATE ricettario SET nome=?, descrizione=?, tipologia=?, alimentazione=?, immagine=?, origine=?, porzioni=?, allergeni=?, kcal=?, tempo_preparazione=? WHERE id=?`,
      [nome, descrizione, tipologia, alimentazione, immagine, origine, porzioni, allergeni, kcal, tempo_preparazione, ricettaId]
    );
    // Cancella ingredienti e reinserisci
    await dbRun('DELETE FROM ingredienti_grammi WHERE ricetta_id = ?', [ricettaId]);
    for (const ing of ingredienti_grammi) {
      await dbRun(
        `INSERT INTO ingredienti_grammi (ricetta_id, ingrediente, grammi, unita) VALUES (?, ?, ?, ?)`,
        [ricettaId, ing.nome, ing.grammi, ing.unita ? ing.unita : 'g']
      );
    }
    // Cancella steps e reinserisci
    await dbRun('DELETE FROM steps WHERE ricetta_id = ?', [ricettaId]);
    if (Array.isArray(steps) && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const testo = steps[i];
        await dbRun(
          `INSERT INTO steps (ricetta_id, step_number, testo) VALUES (?, ?, ?)`,
          [ricettaId, i + 1, testo]
        );
      }
    }
    res.status(200).json({ message: 'Ricetta aggiornata con successo.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della ricetta', details: err.message });
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
    // For each ingredient, insert or update quantity (grams * multiplier) for that recipe
    for (const ing of ingredients) {
      const qty = Math.round(ing.grammi * multiplier);
      await dbRun(
        `INSERT INTO groceryList (user_id, ingredient, quantity, recipe_id) VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, ingredient, recipe_id) DO UPDATE SET quantity = quantity + ?`,
        [userId, ing.ingrediente, qty, recipeId, qty]
      );
    }
    res.status(201).json({ message: 'Ingredients added to grocery list.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to grocery list', details: err.message });
  }
});

// Get the user's grocery list, grouped by recipe
app.get('/api/groceryList', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Get all grocery list items for the user, with recipe info
    const items = await dbAll(
      `SELECT g.ingredient, g.quantity, g.recipe_id, ig.unita, r.nome as recipe_name, r.immagine as recipe_image, r.porzioni as porzioni_originali, ig.grammi as grammi_originali
       FROM groceryList g
       LEFT JOIN ingredienti_grammi ig ON g.ingredient = ig.ingrediente AND g.recipe_id = ig.ricetta_id
       LEFT JOIN ricettario r ON g.recipe_id = r.id
       WHERE g.user_id = ?
       ORDER BY g.recipe_id, g.ingredient`,
      [userId]
    );
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve grocery list', details: err.message });
  }
});

// Remove a single ingredient from the user's grocery list
app.delete('/api/groceryList/ingredient', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  let { ingredient, recipe_id } = req.body;
  if (!ingredient) {
    return res.status(400).json({ error: 'ingredient is required.' });
  }
  if (recipe_id === undefined || recipe_id === null) recipe_id = -1;
  try {
    const result = await dbRun('DELETE FROM groceryList WHERE user_id = ? AND ingredient = ? AND recipe_id = ?', [userId, ingredient, recipe_id]);
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
  let { ingredient, quantity, recipe_id } = req.body;
  if (!ingredient || typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'ingredient and valid quantity are required.' });
  }
  if (recipe_id === undefined || recipe_id === null) recipe_id = -1;
  try {
    const result = await dbRun('UPDATE groceryList SET quantity = ? WHERE user_id = ? AND ingredient = ? AND recipe_id = ?', [quantity, userId, ingredient, recipe_id]);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Ingredient quantity updated.' });
    } else {
      res.status(404).json({ error: 'Ingredient not found in grocery list.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingredient quantity', details: err.message });
  }
});

// Remove all ingredients of a recipe from the user's grocery list
app.delete('/api/groceryList/recipe', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { recipe_id } = req.body;
  if (!recipe_id) {
    return res.status(400).json({ error: 'recipe_id is required.' });
  }
  try {
    const result = await dbRun('DELETE FROM groceryList WHERE user_id = ? AND recipe_id = ?', [userId, recipe_id]);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Tutti gli ingredienti della ricetta rimossi dalla lista.' });
    } else {
      res.status(404).json({ error: 'Nessun ingrediente trovato per questa ricetta nella lista.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Errore nella rimozione degli ingredienti', details: err.message });
  }
});

// Endpoint to get ingredients with grams for a recipe
app.get('/api/ingredienti/:ricettaId', async (req, res) => {
  const ricettaId = req.params.ricettaId;
  try {
    const rows = await dbAll('SELECT ingrediente, grammi, unita FROM ingredienti_grammi WHERE ricetta_id = ?', [ricettaId]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err.message });
  }
});

// DELETE /api/ricette/:id (protected, only author)
app.delete('/api/ricette/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const ricettaId = req.params.id;
  try {
    // Verifica che l'utente sia l'autore
    const rows = await dbAll('SELECT author_id FROM ricettario WHERE id = ?', [ricettaId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Ricetta non trovata.' });
    }
    if (String(rows[0].author_id) !== String(userId)) {
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questa ricetta.' });
    }
    // Elimina ingredienti, steps, ricetta salvata, groceryList, ecc. (integrità referenziale)
    await dbRun('DELETE FROM ingredienti_grammi WHERE ricetta_id = ?', [ricettaId]);
    await dbRun('DELETE FROM steps WHERE ricetta_id = ?', [ricettaId]);
    await dbRun('DELETE FROM ricetteSalvate WHERE id_ricetta = ?', [ricettaId]);
    await dbRun('DELETE FROM groceryList WHERE recipe_id = ?', [ricettaId]);
    await dbRun('DELETE FROM ricettario WHERE id = ?', [ricettaId]);
    res.status(200).json({ message: 'Ricetta eliminata con successo.' });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione della ricetta', details: err.message });
  }
});

// GET /api/ricette-popolari
app.get('/api/ricette-popolari', async (req, res) => {
  try {
    const popolari = await dbAll(`
      SELECT r.id, r.nome, r.descrizione, r.tipologia, r.alimentazione, r.immagine, r.origine, r.porzioni, r.allergeni, r.tempo_preparazione, r.kcal, r.author_id, u.nickname as author, COUNT(s.id_user) as saved_count
      FROM ricettario r
      LEFT JOIN utenti u ON r.author_id = u.id_user
      LEFT JOIN ricetteSalvate s ON r.id = s.id_ricetta
      GROUP BY r.id
      ORDER BY saved_count DESC
      LIMIT 3
    `);
    // For each recipe, fetch steps
    for (const r of popolari) {
      const steps = await dbAll('SELECT step_number, testo FROM steps WHERE ricetta_id = ? ORDER BY step_number ASC', [r.id]);
      r.steps = steps.map(s => s.testo);
    }
    res.json(popolari);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint per il numero di salvataggi di una singola ricetta
app.get('/api/ricetta-saves/:id', async (req, res) => {
  const ricettaId = req.params.id;
  try {
    const row = await dbAll(
      `SELECT COUNT(*) as saved_count FROM ricetteSalvate WHERE id_ricetta = ?`,
      [ricettaId]
    );
    res.json({ saved_count: row[0]?.saved_count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chef/:authorId/ricette - tutte le ricette di un autore
app.get('/api/chef/:authorId/ricette', async (req, res) => {
  const authorId = req.params.authorId;
  try {
    const query = `
      SELECT r.id, r.nome, r.descrizione, r.tipologia, r.alimentazione, r.immagine, r.origine, r.porzioni, r.allergeni, r.tempo_preparazione, r.kcal, r.author_id, u.nickname as author
      FROM ricettario r
      LEFT JOIN utenti u ON r.author_id = u.id_user
      WHERE r.author_id = ?
    `;
    const ricette = await dbAll(query, [authorId]);
    for (const r of ricette) {
      const steps = await dbAll('SELECT step_number, testo FROM steps WHERE ricetta_id = ? ORDER BY step_number ASC', [r.id]);
      r.steps = steps.map(s => s.testo);
    }
    res.json(ricette);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
