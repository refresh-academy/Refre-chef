# Database Migrations

This project uses [Knex.js](https://knexjs.org/) for database schema management and migrations.

## Overview

Database migrations provide a structured way to manage database schema changes in a version-controlled manner. This makes it easier to:
- Track database changes over time
- Roll back to previous versions
- Collaborate with other developers
- Deploy schema changes consistently across environments

## Migration Files

Migrations are stored in the `migrations/` directory and follow the naming convention:
`YYYYMMDDHHMMSS_migration_name.js`

### Current Migrations

- `20241201000001_initial_schema.js` - Creates all initial database tables

## Available Commands

### Run Migrations
```bash
# Run all pending migrations
npm run migrate:latest

# Run migrations for a specific environment
NODE_ENV=production npm run migrate:latest

# Migrate existing database (for databases created before migration system)
npm run migrate:existing

# Test migration functions
npm run migrate:test
```

### Rollback Migrations
```bash
# Rollback the last migration
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback --all
```

### Check Migration Status
```bash
# See which migrations have been run
npm run migrate:status
```

### Create New Migration
```bash
# Create a new migration file
npm run migrate:make add_new_table

# This creates a new file in migrations/ directory
```

## Database Schema

The current database schema includes the following tables:

### Core Tables
- `utenti` - User accounts
- `ricettario` - Recipe information
- `ingredienti_grammi` - Recipe ingredients with quantities

### Feature Tables
- `ricetteSalvate` - User's saved recipes
- `groceryList` - User's grocery lists
- `recensioni` - Recipe reviews/ratings
- `commenti` - Recipe comments
- `notifications` - User notifications
- `contatti` - Contact form submissions

### System Tables
- `knex_migrations` - Migration tracking (managed by Knex)

## Creating New Migrations

When you need to modify the database schema:

1. Create a new migration:
   ```bash
   npm run migrate:make your_migration_name
   ```

2. Edit the generated migration file in `migrations/` directory

3. Implement the `up` and `down` functions:
   ```javascript
   exports.up = function(knex) {
     return knex.schema.createTable('new_table', function(table) {
       table.increments('id').primary();
       table.string('name').notNullable();
       // ... other columns
     });
   };

   exports.down = function(knex) {
     return knex.schema.dropTable('new_table');
   };
   ```

4. Run the migration:
   ```bash
   npm run migrate:latest
   ```

## Best Practices

1. **Always provide rollback logic** - The `down` function should undo what the `up` function does
2. **Test migrations** - Test both up and down migrations before deploying
3. **Backup before major changes** - Always backup your database before running migrations in production
4. **Use transactions** - Knex automatically wraps migrations in transactions
5. **Keep migrations small** - One logical change per migration
6. **Never edit existing migrations** - Create new migrations to fix issues

## Environment Configuration

Migrations use the same environment configuration as the main application:

- **Development**: Uses `./data/myRefrechefDatabase`
- **Production**: Uses `process.env.DB_PATH` or falls back to development path

## Handling Existing Databases

If you have an existing database that was created before the migration system:

### Option 1: Use the Migration Helper (Recommended)
```bash
npm run migrate:existing
```

This script will:
- Check if the migration system is already initialized
- Create the `knex_migrations` table if needed
- Run any pending migrations safely
- Handle existing tables gracefully

### Option 2: Manual Migration
```bash
# Check current migration status
npm run migrate:status

# Run migrations (will skip existing tables)
npm run migrate:latest
```

## Troubleshooting

### Migration Fails
If a migration fails:
1. Check the error message
2. Fix the migration file
3. Rollback if necessary: `npm run migrate:rollback`
4. Re-run: `npm run migrate:latest`

### "Table already exists" Error
This error occurs when trying to create tables that already exist. The migration system now handles this automatically by checking for existing tables before creating them.

### "PRAGMA table_info" Syntax Error
This error occurs when using parameterized queries with PRAGMA statements. SQLite doesn't support parameters in PRAGMA statements. The migration system now uses string concatenation for PRAGMA queries to avoid this issue.

### Database Locked
If you get a "database is locked" error:
1. Make sure no other processes are using the database
2. Check for long-running queries
3. Restart the application

### Foreign Key Constraints
The application enables foreign key constraints with `PRAGMA foreign_keys = ON`. Make sure your migrations respect these constraints.