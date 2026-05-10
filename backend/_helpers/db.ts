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
  const databaseUrl = process.env.DATABASE_URL;

  const sequelizeOptions: any = {
      dialect: 'mysql',
      dialectOptions: {
          ssl: {
              rejectUnauthorized: false
          }
      },
      logging: false
  };

  if (databaseUrl) {
      console.log('Connecting using DATABASE_URL...');
  } else {
      sequelizeOptions.host = host;
      sequelizeOptions.port = Number(port);
      console.log(`Attempting to connect to database: ${database} at ${host}:${port}`);
  }

  const sequelize = databaseUrl 
      ? new Sequelize(databaseUrl, sequelizeOptions)
      : new Sequelize(database, user, password, sequelizeOptions);

  // Init models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models with database
  await sequelize.sync();
  console.log('Database connected and models synced successfully.');
}