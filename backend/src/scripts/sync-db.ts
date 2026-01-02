import db from '../models';

async function syncDatabase() {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync all models
        // force: false ensure we don't drop tables if they exist
        // alter: true updates tables to match models
        await db.sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await db.sequelize.close();
    }
}

syncDatabase();
