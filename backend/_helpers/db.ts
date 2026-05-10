import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

let config: any;
try {
    config = require('../config.json');
} catch (e) {
    config = {
        database: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        secret: process.env.SECRET
    };
}

const db: any = {};
export default db;

initialize().catch((err: any) => {
  console.error('Database initialization failed:', err);
});

async function initialize() {
  console.log('Initializing database connection...');
  
  if (!config.database || !config.database.host) {
      console.error('ERROR: Database configuration is missing. Please set DB_HOST, DB_USER, etc. in Render Environment variables.');
      process.exit(1);
  }

  const { host, port, user, password, database } = config.database;
  const dbPassword = password === 'your_mysql_password' ? '' : password;
  
  // If we are on Render/Production and DB_HOST is set, don't try to create the database 
  // (most hosted DBs don't allow CREATE DATABASE from the app).
  if (!process.env.DB_HOST) {
      const connection = await mysql.createConnection({ host, port, user, password: dbPassword });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await connection.end();
  }

  // Connect to DB
  const sequelize = new Sequelize(database, user, dbPassword, { 
      host: host,
      port: Number(port),
      dialect: 'mysql' 
  });
  console.log(`Connected to database: ${database} at ${host}`);

  // Init models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models with database
  await sequelize.sync();
}