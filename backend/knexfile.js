require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/myRefrechefDatabase'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './data/myRefrechefDatabase'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  }
};