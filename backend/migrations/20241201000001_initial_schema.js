/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if tables already exist and create them only if they don't
  const hasTable = async (tableName) => {
    const result = await knex.raw("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
    return result.length > 0;
  };

  // Users table
  if (!(await hasTable('utenti'))) {
    await knex.schema.createTable('utenti', function(table) {
      table.increments('id_user').primary();
      table.string('nickname').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('reset_token').nullable();
      table.integer('reset_token_expires').nullable();
      table.timestamps(true, true);
    });
  }

  // Recipes table
  if (!(await hasTable('ricettario'))) {
    await knex.schema.createTable('ricettario', function(table) {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.text('descrizione').notNullable();
      table.string('tipologia').notNullable();
      table.string('alimentazione').notNullable();
      table.string('immagine').nullable();
      table.string('origine').nullable();
      table.string('porzioni').notNullable();
      table.text('allergeni').nullable();
      table.string('kcal').nullable();
      table.string('tempo_preparazione').notNullable();
      table.integer('author_id').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('author_id').references('id_user').inTable('utenti').onDelete('CASCADE');
    });
  }

  // Ingredients table
  if (!(await hasTable('ingredienti_grammi'))) {
    await knex.schema.createTable('ingredienti_grammi', function(table) {
      table.increments('id').primary();
      table.integer('ricetta_id').unsigned().notNullable();
      table.string('ingrediente').notNullable();
      table.string('grammi').notNullable();
      table.string('unita').defaultTo('g');
      table.timestamps(true, true);
      
      table.foreign('ricetta_id').references('id').inTable('ricettario').onDelete('CASCADE');
    });
  }

  // Saved recipes table
  if (!(await hasTable('ricetteSalvate'))) {
    await knex.schema.createTable('ricetteSalvate', function(table) {
      table.increments('id').primary();
      table.integer('id_user').unsigned().notNullable();
      table.integer('id_ricetta').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('id_user').references('id_user').inTable('utenti').onDelete('CASCADE');
      table.foreign('id_ricetta').references('id').inTable('ricettario').onDelete('CASCADE');
      table.unique(['id_user', 'id_ricetta']);
    });
  }

  // Grocery list table
  if (!(await hasTable('groceryList'))) {
    await knex.schema.createTable('groceryList', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('ingredient').notNullable();
      table.integer('quantity').defaultTo(1);
      table.integer('recipe_id').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id_user').inTable('utenti').onDelete('CASCADE');
      table.foreign('recipe_id').references('id').inTable('ricettario').onDelete('CASCADE');
      table.unique(['user_id', 'ingredient', 'recipe_id']);
    });
  }

  // Reviews table
  if (!(await hasTable('recensioni'))) {
    await knex.schema.createTable('recensioni', function(table) {
      table.increments('id').primary();
      table.integer('ricetta_id').unsigned().notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.integer('stelle').notNullable();
      table.timestamps(true, true);
      
      table.foreign('ricetta_id').references('id').inTable('ricettario').onDelete('CASCADE');
      table.foreign('user_id').references('id_user').inTable('utenti').onDelete('CASCADE');
      table.unique(['ricetta_id', 'user_id']);
      table.check('stelle >= 1 AND stelle <= 5');
    });
  }

  // Contacts table
  if (!(await hasTable('contatti'))) {
    await knex.schema.createTable('contatti', function(table) {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('email').notNullable();
      table.text('messaggio').notNullable();
      table.timestamps(true, true);
    });
  }

  // Comments table
  if (!(await hasTable('commenti'))) {
    await knex.schema.createTable('commenti', function(table) {
      table.increments('id').primary();
      table.integer('ricetta_id').unsigned().notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.text('testo').notNullable();
      table.timestamps(true, true);
      
      table.foreign('ricetta_id').references('id').inTable('ricettario').onDelete('CASCADE');
      table.foreign('user_id').references('id_user').inTable('utenti').onDelete('CASCADE');
    });
  }

  // Notifications table
  if (!(await hasTable('notifications'))) {
    await knex.schema.createTable('notifications', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('type').notNullable();
      table.text('data').nullable();
      table.integer('read').defaultTo(0);
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id_user').inTable('utenti').onDelete('CASCADE');
    });
  }

  // Add missing columns to existing tables if they don't exist
  const hasColumn = async (tableName, columnName) => {
    const result = await knex.raw(`PRAGMA table_info(${tableName})`);
    return result.some(col => col.name === columnName);
  };

  // Add reset_token columns to utenti table if they don't exist
  if (await hasTable('utenti')) {
    if (!(await hasColumn('utenti', 'reset_token'))) {
      await knex.schema.alterTable('utenti', function(table) {
        table.string('reset_token').nullable();
      });
    }
    if (!(await hasColumn('utenti', 'reset_token_expires'))) {
      await knex.schema.alterTable('utenti', function(table) {
        table.integer('reset_token_expires').nullable();
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Check if tables exist before dropping them
  const hasTable = async (tableName) => {
    const result = await knex.raw("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
    return result.length > 0;
  };

  // Drop tables in reverse order to respect foreign key constraints
  const tablesToDrop = [
    'notifications',
    'commenti', 
    'contatti',
    'recensioni',
    'groceryList',
    'ricetteSalvate',
    'ingredienti_grammi',
    'ricettario',
    'utenti'
  ];

  for (const tableName of tablesToDrop) {
    if (await hasTable(tableName)) {
      await knex.schema.dropTable(tableName);
    }
  }
};