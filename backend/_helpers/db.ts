import { Sequelize, Options } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const sequelizeOptions: Options = {
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 60000
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
};

const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
    sequelize = new Sequelize(databaseUrl, sequelizeOptions);
} else {
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'test';
    
    sequelize = new Sequelize(database, user, password, {
        ...sequelizeOptions,
        host,
        port
    });
}

const db: any = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Init models synchronously so they are instantly available on Vercel cold starts
db.Account = accountModel(sequelize);
db.RefreshToken = refreshTokenModel(sequelize);

// Define relationships
db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
db.RefreshToken.belongsTo(db.Account);

// We can sync in the background without blocking the models from loading
sequelize.sync().catch(err => {
    console.error('Database sync failed:', err);
});

export default db;