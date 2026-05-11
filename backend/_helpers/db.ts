import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const config = {
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    secret: process.env.SECRET
};

const db: any = {};
export default db;

initialize().catch((err: any) => {
    console.error('Database initialization failed:', err);
});

async function initialize() {
    console.log('Initializing database connection...');

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl && (!config.database || !config.database.host)) {
        console.error('ERROR: Database configuration is missing. Please set DATABASE_URL or DB_HOST in environment variables.');
        return; // Don't exit process in Vercel
    }

    const { host, port, user, password, database } = config.database || {};

    const sequelizeOptions: any = {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            },
            connectTimeout: 60000 // 60 seconds
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
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