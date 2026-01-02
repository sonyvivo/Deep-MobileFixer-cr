import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'deep_mobile_crm',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'deep123',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
    }
);

export default sequelize;
