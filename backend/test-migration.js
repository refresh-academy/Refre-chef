const knex = require('knex');
const config = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function testMigration() {
  try {
    console.log('Testing migration system...');
    
    // Test the hasTable function
    const hasTable = async (tableName) => {
      const result = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
      return result.length > 0;
    };
    
    // Test the hasColumn function
    const hasColumn = async (tableName, columnName) => {
      const result = await db.raw(`PRAGMA table_info(${tableName})`);
      return result.some(col => col.name === columnName);
    };
    
    // Test if utenti table exists
    const utentiExists = await hasTable('utenti');
    console.log(`utenti table exists: ${utentiExists}`);
    
    if (utentiExists) {
      // Test if reset_token column exists
      const resetTokenExists = await hasColumn('utenti', 'reset_token');
      console.log(`reset_token column exists: ${resetTokenExists}`);
      
      const resetTokenExpiresExists = await hasColumn('utenti', 'reset_token_expires');
      console.log(`reset_token_expires column exists: ${resetTokenExpiresExists}`);
    }
    
    console.log('✅ Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  testMigration();
}

module.exports = { testMigration };