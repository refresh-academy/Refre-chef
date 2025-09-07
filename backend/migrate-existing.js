const knex = require('knex');
const config = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function migrateExistingDatabase() {
  try {
    console.log('Checking existing database structure...');
    
    // Check if knex_migrations table exists
    const hasMigrationsTable = await db.schema.hasTable('knex_migrations');
    
    if (!hasMigrationsTable) {
      console.log('Creating knex_migrations table...');
      await db.migrate.latest();
      console.log('✅ Migration system initialized successfully!');
    } else {
      console.log('Migration system already initialized.');
    }
    
    // Check migration status
    const [batchNo, log] = await db.migrate.status();
    console.log(`Migration status: ${log.length} migrations completed`);
    
    if (log.length === 0) {
      console.log('No migrations have been run yet. Running initial migration...');
      await db.migrate.latest();
      console.log('✅ Initial migration completed!');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  migrateExistingDatabase();
}

module.exports = { migrateExistingDatabase };