import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
    res.send('Deep Mobile CRM Backend is Running');
});

import apiRoutes from './routes';
app.use('/api', apiRoutes);

export default app;
