import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize().catch((err: any) => {
  console.error('Database initialization failed:', err.message);
});

async function initialize() {
  const { host, port, user, password, database } = config.database;
  // Allow local development defaults: if tutorial placeholder remains, try empty password.
  const dbPassword = password === 'your_mysql_password' ? '' : password;

  const connection = await mysql.createConnection({ host, port, user, password: dbPassword });

  // Create DB if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  // Connect to DB
  const sequelize = new Sequelize(database, user, dbPassword, { dialect: 'mysql' });

  // Init models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models with database
  await sequelize.sync();
}