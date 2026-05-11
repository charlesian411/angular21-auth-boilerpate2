import { Sequelize, Options } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize().catch((err: any) => {
    console.error('Database initialization failed:', err);
});

async function initialize() {
    console.log('Initializing database connection...');

    const databaseUrl = process.env.DATABASE_URL;

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