import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'deep_mobile_crm';

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'deep123',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default postgres DB first
});

async function createDatabase() {
    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
