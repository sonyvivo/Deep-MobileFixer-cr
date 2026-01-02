import app from './app';
// import sequelize from './config/database'; 

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // Database connection is already handled in config/database.ts or we can explicitly connect here
    // try {
    //   await sequelize.authenticate();
    //   console.log('Database connected!');
    // } catch (e) {
    //   console.error('Database connection failed', e);
    // }
});
